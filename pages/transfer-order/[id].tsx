// @ts-nocheck
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Divider, IconButton } from '@mui/material';
import _ from 'lodash';
import TextField from '@mui/material/TextField';

import {
  Save,
  PlaylistAddCheck,
  CreateNewFolder,
  DeleteForever,
  PostAdd,
  Print,
  Dangerous,
} from '@mui/icons-material';
import Seo from '@/shared/layout-components/seo/seo';

import SelectPro from '../../component-lib/select';
import {
  Breadcrumb,
  Col,
  Row,
  Form,
  Card,
  Stack,
  InputGroup,
} from 'react-bootstrap';
import { useToken } from '@/lib/hooks/use-token';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import {
  useCreateTransferOrder,
  useUpdateTransferOrder,
  useApproveOrder,
  usePdfTransferOrder,
  useGetTransferOrderById,
} from '@/rest/transfer';
import { Switch } from '@mui/material';

import {
  DECIMAL_GREATER_EQUAL_0_NULLABLE,
  DECIMAL_GREATER_THAN_0,
} from '@/lib/constants';
import { useAtom } from 'jotai';
import { storeInfoAtomS, useClearAllAtom } from '@/stores/atom';
import { set, Controller, useForm, useFieldArray } from 'react-hook-form';

import { Button, ButtonGroup } from '@mui/joy';
import { useGetAllVendors } from '@/rest/vendor';

import Select from 'react-select';
import { toastOptions } from '@/utils/public';
import { getStoreLogoUrl } from '@/lib/sys';

import { useMe } from '@/rest/auth';
import { toast } from 'react-toastify';
import { useGetWarehouse, useSearchLog } from '@/rest/inv';
import { ConfirmModal } from '@/component-lib/modal/confirm-modal';

import { OrderResponse } from '@/types/public';
import { useGetAllUnits } from '@/rest/unit';
import { useGetZonesByWarehouse } from '@/rest/location';
import { parseLocationCode } from '@/service/location';

import {
  checkData,
  formatTransferOrderDetailForEdit,
  formatTransferOrderHeaderForEdit,
  formatPdfData,
  formatItemListData,
} from '@/service/transfer';

import { customFilterForSelect } from '@/service/items';
import { useSearchInventories } from '@/rest/inventory';
import { convertTransferItemsOptions } from '@/utils/convertToSelectOptions';
import { getStaticTranslations } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';

export const getStaticPaths = async ({ locales }: { locales?: string[] }) => ({
  paths: (locales ?? ['en', 'zh']).map((locale) => ({
    params: { id: 'create' },
    locale,
  })),
  fallback: 'blocking',
});

export async function getStaticProps({ locale }: { locale: string }) {
  return getStaticTranslations(locale, ['common', 'transfer_order', 'menu']);
}

const Main = (props: any) => {
  // Values  ----------------------------------------------------
  const { transferOrder, type, id, refetchOrder } = props;
  const defaultTotal = {
    subtotal: 0,
    total: 0,
    tax: 0,
    shipping_fee: 0,
  };
  const display = React.useRef('none');

  // Atoms ----------------------------------------------------

  const [storeInfo] = useAtom(storeInfoAtomS);

  // UseRef --------------------------------
  const targetRef = useRef<HTMLDivElement>(null);
  const selectItemRef = useRef<any>(null); // 创建 ref

  // UseState  ----------------------------------------------------
  const [itemListDatas, setItemListDatas] = useState<any[]>([]);

  const [defaultFormDate, setDefaultFormDate] = useState<any>();
  const [orderTotal, setOrderTotal] = useState<any>(defaultTotal);
  const [confirmModalShow, setConfirmModalShow] = useState(false);
  const [voidConfirmModalShow, setVoidConfirmModalShow] = useState(false);

  const [isVoid, setIsVoid] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [orderSeqNo, setOrderSeqNo] = useState('');
  const [showFooter, setShowFooter] = useState(true);
  const [isFinished, setIsFinished] = useState(true);
  const [showItemBar, setShowItemBar] = useState(false);

  const [enableSearchBar, setEnableSearchBar] = useState(false);
  const [fromWarehouseId, setFromWarehouseId] = useState<number>();
  const [toWarehouseId, setToWarehouseId] = useState<number>();
  const [allItemsOptions, setAllItemsOptions] = useState<any[]>([]);

  const [lockedWarehouse, setLockedWarehouse] = useState(false);

  // useRef
  const saveType = useRef('');

  // Use-Form ----------------------------------------------------------------
  const {
    register,
    handleSubmit: handleSubmitMain,
    formState: { errors },
    getValues,
    setValue,
    reset,
    control,
  } = useForm({
    mode: 'onTouched',
    reValidateMode: 'onSubmit',
    values: defaultFormDate,
  });
  const { fields, append, remove, prepend } = useFieldArray({
    control,
    name: 'items',
  });

  // #region Hooks  ---------------------------------------------------------
  const { t } = useTranslation('transfer_order');
  const { t: t0 } = useTranslation('common'); // 加载 xxx.json 翻译文件

  const routes = useRouter();
  const clearAllAtom = useClearAllAtom();
  const { mutate: getMe, data: me, isLoading: isLoadingMe, isMe } = useMe();

  const { data: warehouseData } = useGetWarehouse({ isActive: true });

  const {
    mutate: getFromWarehouseLocation,
    data: fromLocationData,
    isLoading: isLoadingFromLocationData,
    serverError: fromLocationDataError,
  } = useGetZonesByWarehouse();

  const {
    mutate: getToWarehouseLocation,
    data: toLocationData,
    isLoading: isLoadingToLocationData,
    serverError: toLocationDataError,
  } = useGetZonesByWarehouse();

  const {
    mutate: pdfOrder,
    data: orderPdfData,
    isLoading: isLoadingOrderPdf,
    serverError: pdfOrderError,
  } = usePdfTransferOrder();

  const {
    mutate: createOrder,
    data: createdOrderRes,
    isLoading: isLoadingCreateOrder,
    serverError: createOrderError,
  } = useCreateTransferOrder();

  const {
    mutate: updateOrder,
    data: updateOrderRes,
    isLoading: isLoadingUpdateOrder,
    serverError: updateOrderError,
  } = useUpdateTransferOrder();

  const {
    mutate: approveOrder,
    data: approveOrderRes,
    isLoading: isLoadingApproveOrder,
    serverError: approveOrderError,
  } = useApproveOrder();

  const {
    mutate: searchLogs,
    data: logsRes,
    isLoading: isLogsRes,
    serverError: searchLogsError,
  } = useSearchLog();

  const {
    mutate: searchInvMutate,
    data: inventoriesRes,
    isLoading: searchInvIsLoading,
    serverError,
    setServerError,
  } = useSearchInventories();
  // #endregion
  // #region Use Effect  ----------------------------------------------------
  useEffect(() => {
    clearAllData();
    routes.replace(routes.asPath); //为了避免页面切换时的缓存，要强制刷新一次页面
    // 滚动到某个Dom 位置时，显示item搜索条
    const handleScroll = () => {
      if (!targetRef.current) {
        return;
      }
      const targetPosition =
        targetRef.current.getBoundingClientRect().top + window.scrollY;
      const shouldHideHeader = window.scrollY > targetPosition; // 滚动超过组件位置时隐藏 header
      setShowItemBar(shouldHideHeader);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {};
  }, []);

  useEffect(() => {
    if (allItemsOptions?.length > 0) {
      //select 获取焦点
      selectItemRef.current?.focus();
    }
  }, [allItemsOptions]);

  useEffect(() => {
    if (fromWarehouseId && fromWarehouseId > 0) {
      getFromWarehouseLocation({ warehouseId: fromWarehouseId });
      setValue('locationCode', '');
      searchInvMutate({
        params: { page: 1, pageSize: 9999 },
        payload: {
          warehouseId: fromWarehouseId,
        },
      });
      //
      if (toWarehouseId && toWarehouseId > 0) {
        setEnableSearchBar(true);
      }
    }
  }, [fromWarehouseId]);

  useEffect(() => {
    if (toWarehouseId && toWarehouseId > 0) {
      getToWarehouseLocation({ warehouseId: toWarehouseId });
      setEnableSearchBar(true);
      setValue('locationCode', '');
      if (fromWarehouseId && fromWarehouseId > 0) {
        setEnableSearchBar(true);
      }
    }
  }, [toWarehouseId]);

  useEffect(() => {
    if (inventoriesRes?.code === 0) {
      //转化为options
      const itemOptions = convertTransferItemsOptions(inventoriesRes.data.data);
      setAllItemsOptions(itemOptions);
    }
  }, [inventoriesRes]);

  useEffect(() => {
    if (orderPdfData) {
      //@ts-ignore
      const blob = new Blob([orderPdfData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  }, [orderPdfData]);

  useEffect(() => {
    if (defaultFormDate) {
      setDefaultWarehouseAndVendor();
    }

    if (warehouseData) {
      setDefaultWarehouse();
    }
  }, [defaultFormDate, warehouseData]);

  // [***Update***Begin***] 模式下格式化加载进货单内容
  useEffect(() => {
    if (transferOrder?.data !== null && transferOrder?.data !== undefined) {
      processTransferOrderData(transferOrder.data);
      setFromWarehouseId(transferOrder.data.from_warehouse_id);
      setToWarehouseId(transferOrder.data.to_warehouse_id);
      getFromWarehouseLocation({
        warehouseId: transferOrder.data.from_warehouse_id,
      });
    } else {
      setDefaultDate();
    }
  }, [transferOrder]);
  // [***Update***End***]

  useEffect(() => {
    if (createdOrderRes || createOrderError) {
      handleResponse(
        createdOrderRes as OrderResponse,
        true,
        createOrderError || '',
      ); // 使用空对象 {} 代替 undefined
    }
    if (updateOrderRes || updateOrderError) {
      handleResponse(
        updateOrderRes as OrderResponse,
        false,
        updateOrderError || '',
      ); // 使用空对象 {} 代替 undefined
    }
  }, [createdOrderRes, createOrderError, updateOrderRes, updateOrderError]);

  useEffect(() => {
    if (approveOrderRes?.code === 0) {
      toast.success('Approve Successfully', toastOptions);
      refetchOrder();
    } else if (approveOrderRes?.msg) {
      toast.error(`Approve failed:${approveOrderRes?.data}`, toastOptions);
      refetchOrder();
    }
  }, [approveOrderRes]);
  // #endregion
  // #region Function ------------------------------------------------

  // 辅助函数：处理响应逻辑
  const handleResponse = (
    response: OrderResponse,
    isCreate: boolean,
    error: string,
  ) => {
    if (response?.code === 0) {
      if (saveType.current === 'savenew') {
        clearAllAtom();
        clearAllData();
        routes.push('/transfer-order/create');
      } else {
        routes.push(`/transfer-order/${response.data.id}`);
        if (!isCreate) refetchOrder(); // 如果是更新操作则重新获取订单数据
      }
      // 根据创建或更新操作显示不同的成功提示
      toast.success(
        isCreate
          ? t('toast_transfer_order_created_successfully')
          : t('toast_order_update_successfully'),
        toastOptions,
      );
    } else if (response && response?.code > 0) {
      toast.error(`Save failed: ${response.data}`, toastOptions);
    } else if (!_.isEmpty(error)) {
      toast.error(error || 'An unknown error occurred', toastOptions);
    }
  };

  // 提取入库单数据处理函数
  const processTransferOrderData = (data: any) => {
    // 设置订单编号和状态
    setOrderSeqNo(data.order_no);
    setIsApproved(data.is_approved);
    setIsVoid(data.isVoid);

    // 格式化数据
    // const purchaseItems = formatPurOrderDetailDataForEdit(data.purchaseItems);
    const orderHeader = formatTransferOrderHeaderForEdit(data);
    const orderDetail = formatTransferOrderDetailForEdit(
      data.transferOrderDetails,
    );

    const orderForm = { ...orderHeader, items: [...orderDetail] };

    // 更新状态
    setDefaultFormDate(orderForm);
    // setItemListDatas([...purchaseItems]);

    // 搜索日志
    searchLogs({ order_id: data.id });
  };

  const setDefaultDate = () => {
    const today = dayjs().toDate();
    setDefaultFormDate(() => ({
      ...defaultFormDate,
      // transfer_date: today,
    }));
  };

  function setDefaultWarehouse() {
    if (type !== 'create') return;
    const defaultWarehouse = warehouseData?.data.filter((item: any) => {
      return item.isDefault === true;
    });

    if (defaultWarehouse?.length > 0 && defaultFormDate) {
      defaultFormDate.warehouse = defaultWarehouse[0];
      reset(defaultFormDate);
    }
  }

  // Save & Create 用
  function setDefaultWarehouseAndVendor() {
    if (type !== 'create') return;

    const defaultWarehouse = warehouseData?.data.filter((item: any) => {
      return item.isDefault === true;
    });

    if (defaultWarehouse?.length > 0 && defaultFormDate) {
      defaultFormDate.warehouse = defaultWarehouse[0];
    }
    reset(defaultFormDate);
  }

  //自定义查询  返回boolean类型
  //searchFields.some(...) 用于检查 searchFields 数组中是否有至少一个字段（field）包含 inputValue
  const customFilter = (option: any, inputValue: any) => {
    option.data.search = option.data.item.search;
    return customFilterForSelect(option, inputValue, true);
  };

  const setApproved = () => {
    approveOrder({ id });
  };

  const clearAllData = () => {
    setItemListDatas([]);
    setValue('items', []);
    setOrderTotal(defaultTotal);
    setDefaultWarehouseAndVendor();
  };

  const onSubmit = (data: any) => {
    const checkRes = checkData(data);
    if (!checkRes) return;
    //-------------------------------------------------
    if (data?.items?.length > 0) {
      //
      const header = {
        ...data,
        from_warehouse_id: Number(data.fromWarehouse.value),
        to_warehouse_id: Number(data.toWarehouse.value),
      };
      const resFormatItemListData = formatItemListData(data.items);

      if (resFormatItemListData.code !== 0) {
        toast.error(resFormatItemListData.msg, toastOptions);
        return false;
      }
      const allData = {
        ...header,
        transfreOrderDetail: resFormatItemListData.data,
      };

      if (type === 'create') {
        // @ts-ignore
        createOrder(allData);
      }
      if (type === 'edit') {
        // @ts-ignore
        updateOrder({ id, data: allData });
      }
    } else {
      toast.error('Please add at least one item', toastOptions);
      return;
    }
  };

  function handleFromLocationsCode(locationCode: string) {
    if (fromWarehouseId && fromWarehouseId > 0) {
      const options = parseLocationCode(
        locationCode,
        fromLocationData?.data,
        storeInfo,
        fromWarehouseId,
      );
      return options;
    }
  }
  function handleToLocationsCode(locationCode: string) {
    if (toWarehouseId && toWarehouseId > 0) {
      const options = parseLocationCode(
        locationCode,
        toLocationData?.data,
        storeInfo,
        toWarehouseId,
      );
      return options;
    }
  }

  // #endregion
  // #region Compouent -------------------------------------------------

  const Footer = () => {
    return (
      !isApproved && (
        <>
          {showFooter && (
            <div
              className="main-footer pos-fixed l-0 b-0 "
              style={{ zIndex: 99999, width: '100%' }}
            >
              <div className="d-flex flex-row justify-content-center pt-0 ht-100p text-center">
                <Row>{!isApproved && showFooter && <SaveButtonGroup />}</Row>
              </div>
            </div>
          )}
        </>
      )
    );
  };

  const ItemSearchBar = () => {
    return (
      !isApproved && (
        <>
          {showItemBar && (
            <div
              className="main-footer pos-fixed ht-70 l-0 t-0 bd-y "
              style={{ zIndex: 99999, width: '100%' }}
            >
              <div className="d-flex flex-row justify-content-center pt-0 ht-100p text-center">
                {allItemsOptions && (
                  <Row className="flex-fill pd-t-6 pd-b-6 ">
                    <Col xs={10} lg={11}>
                      <Select
                        className=""
                        ref={selectItemRef} // 绑定 ref
                        value={null}
                        // rules={{ required: 'Username is required' }}
                        onChange={(value: any) => {
                          prepend({
                            remark: '',
                            inventory_id: value.id, // 注意不是item的id
                            detail: { ...value },
                            toLocationCode: '',
                            transfer_quantity: 0,
                          });
                        }}
                        options={allItemsOptions}
                        isMulti={false}
                        // @ts-ignore
                        rules={{ required: 'Item is required' }}
                        filterOption={customFilter}
                      />
                    </Col>
                  </Row>
                )}
              </div>
            </div>
          )}
        </>
      )
    );
  };

  const SaveButtonGroup = () => {
    return (
      <ButtonGroup>
        <Button
          startDecorator={<Save />}
          color="primary"
          variant="soft"
          type="submit"
          onClick={() => {
            handleSubmitMain(onSubmit)();
            saveType.current = 'save';
          }}
          disabled={
            type === 'create' ? isLoadingCreateOrder : isLoadingUpdateOrder
          }
        >
          {isLoadingCreateOrder || isLoadingUpdateOrder
            ? t('btn_saving')
            : t('btn_save')}
        </Button>

        <Button
          startDecorator={<CreateNewFolder />}
          color="success"
          variant="soft"
          type="button"
          onClick={() => {
            handleSubmitMain(onSubmit)();
            saveType.current = 'savenew';
          }}
          disabled={
            type === 'create' ? isLoadingCreateOrder : isLoadingUpdateOrder
          }
        >
          {isLoadingCreateOrder || isLoadingCreateOrder
            ? t('btn_saving')
            : t('btn_new')}
        </Button>

        <Button
          startDecorator={<PlaylistAddCheck />}
          color="warning"
          variant="soft"
          onClick={() => {
            setConfirmModalShow(true);
          }}
          disabled={type === 'create'}
        >
          {isLoadingApproveOrder ? t('btn_approving') : t('btn_approve')}
        </Button>
      </ButtonGroup>
    );
  };

  const SearchItemCard = () => {
    return (
      <>
        {allItemsOptions && enableSearchBar && (
          <Row className="bg-gray-100 pd-t-6 pd-b-6 ">
            <Col xs={2} lg={2}>
              <TextField
                id="outlined-search"
                label="Location Code"
                type="search"
                size="small"
                color="secondary"
                onKeyDown={(event: any) => {
                  if (event.key === 'Enter') {
                    const locationCode = event.target.value; // 获取文本框内容
                    const fromWarehouse = getValues('fromWarehouse');
                    if (fromWarehouse && !_.isEmpty(locationCode)) {
                      const payload: any = {
                        warehouseId: fromWarehouse.value,
                      };
                      const location = handleFromLocationsCode(
                        locationCode.toUpperCase(),
                      );

                      if (!location?.zone) {
                        toast.error(
                          'Can not find location. Please check if the Code belongs to selected warehouse',
                          toastOptions,
                        );
                      }
                      payload.location = location;
                      searchInvMutate({
                        params: { page: 1, pageSize: 200 },
                        payload,
                      });
                    } else {
                      toast.error(
                        'Please select a warehouse for transfer',
                        toastOptions,
                      );
                    }
                  }
                }}
                sx={{
                  backgroundColor: 'white', // 设置背景色为白色
                }}
              />
            </Col>
            <Col xs={6} lg={6}>
              <Select
                className=""
                ref={selectItemRef} // 绑定 ref
                value={null}
                // rules={{ required: 'Username is required' }}
                onChange={(value: any) => {
                  prepend({
                    remark: '',
                    inventory_id: value.id, // 注意不是item的id
                    detail: { ...value },
                    toLocationCode: '',
                    transfer_quantity: 0,
                  });
                  setLockedWarehouse(true);
                }}
                options={allItemsOptions}
                isMulti={false}
                // @ts-ignore
                rules={{ required: 'Item is required' }}
                filterOption={customFilter}
              />
            </Col>
          </Row>
        )}
      </>
    );
  };
  // #endregion
  return (
    <div>
      <ItemSearchBar />
      <ConfirmModal
        key={1}
        show={confirmModalShow}
        setShow={setConfirmModalShow}
        fun={() => {
          setApproved();
          setConfirmModalShow(false);
        }}
        info={{
          title: 'Confirm Approve Order',
          body: 'Please double-check this order!',
          buttonName: 'Approve',
        }}
      />
      <ConfirmModal
        key={2}
        show={voidConfirmModalShow}
        setShow={setVoidConfirmModalShow}
        fun={() => {
          setVoidConfirmModalShow(false);
        }}
        info={{
          title: 'Confirm VOID this Order',
          body: (
            <span>
              Please confirm you will{' '}
              <span className="tx-16 text-danger">VOID this Order</span> . After
              VOID, the inventory will be changed and{' '}
              <span className="tx-16 text-danger">Can Not be Revoked!</span>
            </span>
          ),
          buttonName: 'VOID this Order',
        }}
      />
      <Seo title={'Product Form'} /> {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content ">
          <div className="d-flex flex-row align-items-center">
            <span className="main-content-title mg-b-0 mg-b-lg-1">
              {transferOrder?.data?.order_no
                ? transferOrder?.data?.order_no
                : t('transfer_order')}
            </span>
            {isApproved && !isVoid && (
              <>
                <span className="badge tx-16 badge-pill bg-indigo  mg-l-10 mg-r-10">
                  {t('lb_approved')}
                </span>
                {isFinished && (
                  <span className="badge tx-16 badge-pill bg-success  ">
                    {t('lb_finished')}
                  </span>
                )}
                {isPicking && (
                  <span className="badge tx-16 badge-pill bg-warning  ">
                    {t('lb_picking')}
                  </span>
                )}
              </>
            )}
            {isVoid && (
              <span className="badge tx-16 badge-pill bg-danger  mg-l-10 mg-r-20">
                {t('lb_void')}
              </span>
            )}
          </div>
        </div>
        {type !== 'create' && (
          <Row>
            <div className="  pd-l-10 ">
              <Button
                size="sm"
                startDecorator={<Print />}
                color="primary"
                variant="soft"
                onClick={() => {
                  const pdfDataParams = formatPdfData(transferOrder?.data);
                  //@ts-ignore
                  pdfDataParams.storeImageUrl = getStoreLogoUrl(storeInfo?.logo_url);
                  pdfOrder(pdfDataParams);
                }}
                disabled={type === 'create'}
              >
                {isLoadingOrderPdf ? t('btn_printing') : t('btn_print_order')}
              </Button>
            </div>
          </Row>
        )}

        <Row>{!isApproved && !showFooter && <SaveButtonGroup />}</Row>
        <div className="justify-content-center mt-2">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item className="breadcrumb-item tx-15" href="">
              {t('transfer_order')}
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className="breadcrumb-item "
              active
              aria-current="page"
            >
              {type}
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      {/* <!-- /breadcrumb --> */}
      <Form className="form-horizontal">
        <Row>
          <Col lg={9}>
            <Card className="card custom-card">
              <Card.Header className="card-header">
                <Card.Body>
                  <Row className="row-xs">
                    {/* warehouse */}
                    <Col
                      md={3}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 199 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_from_warehouse')}</Form.Label>
                        {warehouseData?.data && (
                          <SelectPro
                            key="fromWarehouse"
                            name="fromWarehouse"
                            control={control}
                            defaultValue={undefined}
                            options={warehouseData.data}
                            isMulti={false}
                            rules={{ required: t('lb_warehouse_required') }}
                            filterOption={undefined}
                            isDisabled={lockedWarehouse}
                            onChangeHandler={(val: any) => {
                              setFromWarehouseId(val.value);
                            }}
                            //isDisabled={itemListDatas?.length > 0}
                          />
                        )}
                      </Form.Group>
                    </Col>
                    <Col
                      md={3}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 891 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_to_warehouse')}</Form.Label>
                        {warehouseData?.data && (
                          <SelectPro
                            key="toWarehouse"
                            name="toWarehouse"
                            control={control}
                            defaultValue={undefined}
                            options={warehouseData.data}
                            isMulti={false}
                            rules={{ required: t('lb_warehouse_required') }}
                            filterOption={undefined}
                            isDisabled={lockedWarehouse}
                            onChangeHandler={(val: any) => {
                              setToWarehouseId(val.value);
                            }}
                            //isDisabled={itemListDatas?.length > 0}
                          />
                        )}
                      </Form.Group>
                    </Col>

                    {/* <Col
                      xs={12}
                      lg={3}
                      xl={3}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 180 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>Transfer Date</Form.Label>
                        <InputGroup className="input-group reactdate-pic">
                          <InputGroup.Text className="input-group-text">
                            <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                          </InputGroup.Text>
                          <div className="wd-150">
                            <Datepicker
                              key="transfer_date"
                              name="transfer_date"
                              control={control}
                              isMulti={false}
                              rules={{ required: 'Transfer Date is required' }}
                            />
                          </div>
                        </InputGroup>
                      </Form.Group>
                    </Col> */}
                  </Row>
                </Card.Body>
              </Card.Header>
            </Card>
            <div ref={targetRef}></div>
            {/* ----------------------------表明细------------------------------------ */}
            <Card className="card custom-card">
              <Card.Body>
                <Stack gap={2}>
                  <SearchItemCard />

                  {fields.map((item: any, index) => {
                    return (
                      <div key={item.id} className="mg-t-6 ">
                        <Stack>
                          <Row className="bg-gray-100 pd-t-4  tx-14 text-orange">
                            <Col md={8} xs={10}>
                              <Stack direction="horizontal" gap={3}>
                                {item.detail && (
                                  <span>
                                    {`#${index}-${item.detail.label}`}
                                  </span>
                                )}
                              </Stack>
                            </Col>
                            <Col md={4} xs={2}>
                              <div className="d-flex flex-row justify-content-end">
                                <IconButton
                                  aria-label="Delete"
                                  color="warning"
                                  onClick={() => {
                                    remove(index);
                                  }}
                                  //disabled={type === 'create'}
                                >
                                  <DeleteForever />
                                </IconButton>
                              </div>
                            </Col>
                          </Row>
                          <Row className="bg-gray-100 pd-b-6">
                            <Col xs={6} md={2} className=" pd-b-6 ">
                              <Form.Label htmlFor={`item-${index}`}>
                                {t('lb_transfer_qty')}
                                {`(>0)`}
                              </Form.Label>
                              <Form.Control
                                {...register(
                                  `items.${index}.transfer_quantity`,
                                  {
                                    required: true,
                                    validate: (value: any): any => {
                                      var pPattern = DECIMAL_GREATER_THAN_0;

                                      if (!pPattern.test(value)) {
                                        return t(
                                          'lb_must_be_a_number_and_gt_0',
                                        );
                                      }
                                    },
                                  },
                                )}
                                defaultValue={item.transfer_quantity}
                                style={{ textAlign: 'right' }}
                                placeholder=""
                                type="text"
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  // 直接通过setValue更新当前更改的input的值
                                  // 如果值大于Balance的值,则只能是Balance的数量

                                  setValue(
                                    `items[${index}].transfer_quantity`,
                                    newVal > item.detail.balance_quantity
                                      ? item.detail.balance_quantity
                                      : newVal,
                                  );
                                }}
                                onFocus={(e) => {
                                  // 在获得焦点时全选输入框中的内容
                                  e.target.select();
                                }}
                              />

                              {errors &&
                              Object.keys(errors?.transfer_quantity || {})
                                .length > 0 ? (
                                <>
                                  <Form.Text className="text-danger">
                                    {errors.transfer_quantity &&
                                      // @ts-ignore
                                      errors.items[index]?.transfer_quantity
                                        ?.message}
                                  </Form.Text>
                                </>
                              ) : (
                                <></>
                              )}
                            </Col>

                            <Col xs={6} md={2} className="  ">
                              <Form.Label htmlFor={`item-${index}`}>
                                {`=> `}
                                {t('lb_to_location_code')}
                              </Form.Label>
                              <Form.Control
                                {...register(`items.${index}.toLocationCode`, {
                                  required: false,
                                })}
                                placeholder=""
                                type="text"
                                // 0110 需要验证一下当回车后 locationcode是否和检查过的lode一致，不一致给提示
                                onKeyDown={(event: any) => {
                                  if (event.key === 'Enter') {
                                    const checkCode = handleToLocationsCode(
                                      event.target.value,
                                    );
                                    if (
                                      !checkCode ||
                                      checkCode?.checkLocation !==
                                        event.target.value
                                    ) {
                                      toast.error(
                                        'Can not find location. Please check if the Code belongs to selected warehouse',
                                        toastOptions,
                                      );
                                      setValue(
                                        `items[${index}].toLocationCode`,
                                        '',
                                      );
                                    }
                                  }
                                }}
                                onChange={(e) => {}}
                                onFocus={(e) => {
                                  // 在获得焦点时全选输入框中的内容
                                  e.target.select();
                                }}
                              />
                            </Col>
                            <Col xs={6} lg={7} className="  ">
                              <Form.Label htmlFor={`item-${index}`}>
                                {t('lb_remarks')}
                              </Form.Label>
                              <Form.Control
                                {...register(`items.${index}.remark`)}
                                defaultValue={item.remark}
                                placeholder=""
                                type="text"
                              />
                            </Col>
                          </Row>
                        </Stack>
                      </div>
                    );
                  })}
                </Stack>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3}>
            <Card className="card custom-card">
              <Card.Header className="card-header">
                <Card.Title>{t('lb_remarks')}</Card.Title>
                <Card.Body>
                  <Stack direction="vertical" gap={3}>
                    <textarea
                      {...register('remark')}
                      className="form-control "
                      placeholder="Remark"
                      rows={2}
                    />
                    <textarea
                      {...register('highlight')}
                      className="form-control "
                      placeholder="Highlight on List"
                      rows={2}
                    />
                    <textarea
                      {...register('print_remark')}
                      className="form-control "
                      placeholder="Print_remark"
                      rows={2}
                    />
                  </Stack>
                </Card.Body>
              </Card.Header>
            </Card>
            {logsRes && (
              <Card>
                <Card.Header className="bg-transparent pb-0">
                  <div>
                    <h3 className="card-title mb-2">Audit</h3>
                  </div>
                </Card.Header>
                <Card.Body className=" mt-0">
                  <div className="latest-timeline mb-0">
                    <ul className="timeline mb-0">
                      {logsRes.map((log: any) => {
                        return (
                          <>
                            <li>
                              <div className="featured_icon success">
                                <i className="fas fa-circle"></i>
                              </div>
                            </li>
                            <li className="mt-0 activity">
                              <div>
                                <span className="tx-11 text-muted float-end">
                                  {dayjs(log.updatedAt).format(
                                    'YYYY-MM-DD HH:mm:ss',
                                  )}
                                </span>
                              </div>
                              <span className="tx-12 text-dark">
                                <p className="mb-1 font-weight-semibold text-dark tx-13">
                                  {String(log.desc).toUpperCase()}
                                </p>
                              </span>
                              <p className="text-muted mt-0 mb-0 tx-12">
                                {log.user_snapshot} -{' ['}
                                <span className="text-success">
                                  {String(log.desc).toUpperCase()}
                                </span>
                                {'] '}- order
                              </p>
                            </li>
                          </>
                        );
                      })}
                    </ul>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Form>
      <div className="mg-b-40">
        <Footer />
      </div>
    </div>
  );
};
const TransferOrder = () => {
  // Auth ----------------------------------------------------------------
  const { hasToken, removeToken } = useToken();
  const routes = useRouter();
  // Values  ----------------------------------------------------

  const { id } = routes.query;
  // UseState  ----------------------------------------------------
  const [type, setType] = useState('');
  // Hooks  ----------------------------------------------------
  const clearAllAtoms = useClearAllAtom();
  const { mutate: getMe, data: me, isLoading: isLoadingMe, isMe } = useMe();
  const { data: transferOrder, refetch } = useGetTransferOrderById({ id });

  // Use Effect  ------------------------------------------------
  useEffect(() => {
    getMe();
    clearAllAtoms();
  }, []);

  useEffect(() => {}, [me]);
  useEffect(() => {
    if (id === undefined) return;
    if (id !== 'create') {
      setType('edit');
      refetch();
    } else {
      setType('create');
    }
  }, [id]);

  useEffect(() => {
    if (!transferOrder) return;
    if (transferOrder.code !== 0) {
      toast.error(`Error:${transferOrder.msg}`, toastOptions);
    }
    if (!(transferOrder as { data: any }).data) {
      routes.push('/transfer-order/create');
    }
  }, [transferOrder]);

  return (
    <>
      {isMe && (
        <>
          {type === 'create' && (
            <Main type={type} transferOrder={transferOrder} id={id} />
          )}

          {type === 'edit' &&
          transferOrder?.code === 0 &&
          (transferOrder as { data: any }).data ? (
            <Main
              type={type}
              transferOrder={transferOrder}
              id={id}
              refetchOrder={() => {
                refetch();
              }}
            />
          ) : (
            ''
          )}
        </>
      )}
    </>
  );
};

TransferOrder.layout = 'Contentlayout';

export default TransferOrder;
