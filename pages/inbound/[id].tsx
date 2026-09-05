// @ts-nocheck
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Divider, IconButton } from '@mui/material';
import _ from 'lodash';
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
import Datepicker from '../../component-lib/form-ele';
import dayjs from 'dayjs';
import {
  useCalculateInboundOrder,
  useCreateInboundOrder,
  useGetInboundOrderById,
  usePdfInboundOrder,
  useUpdateInboundOrder,
  useApproveOrder,
  useVoidOrder,
  fetchInboundOrderById,
} from '@/rest/inbound';
import { Switch } from '@mui/material';

import {
  DECIMAL_GREATER_EQUAL_0_NULLABLE,
  DECIMAL_GREATER_THAN_0,
} from '@/lib/constants';
import { useAtom } from 'jotai';
import {
  openItemModalAtom,
  openVendorModalAtom,
  orderExtendInfoAtomS,
  orderMultiUnitAtomS,
  storeInfoAtomS,
  useClearAllAtom,
} from '@/stores/atom';
import { set, Controller, useForm, useFieldArray } from 'react-hook-form';

import { Button, ButtonGroup } from '@mui/joy';
import { useGetAllVendors } from '@/rest/vendor';
import { useGetAllItems } from '@/rest/items';
import Select from 'react-select';
import { toastOptions } from '@/utils/public';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import { useMe } from '@/rest/auth';
import { toast } from 'react-toastify';
import { ItotalAmount } from '@/types/inbound';
import { useGetWarehouse, useSearchLog } from '@/rest/inv';
import { ConfirmModal } from '@/component-lib/modal/confirm-modal';
import { ItemDialog } from '@/component-lib/modal/meta/ItemDialog';
import { VendorDialog } from '@/component-lib/modal/meta/VendorDialog';
import { OrderResponse } from '@/types/public';
import { useGetAllUnits } from '@/rest/unit';
import { useGetZonesByWarehouse } from '@/rest/location';
import {
  getBinsByShelf,
  getShelvesByZone,
  getZonesOptions,
  parseLocationCode,
} from '@/service/location';
import {
  checkData,
  formatInboundOrderDetailForEdit,
  formatInboundOrderHeaderForEdit,
  formatItemListData,
  formatPdfData,
  orderTypeOptions,
} from '@/service/inbound';
import { customFilterForSelect } from '@/service/items';
import { getStaticTranslations } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { parse } from 'cookie';
import { AUTH_TOKEN_KEY } from '../../lib/constants';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;
  try {
    return getStaticTranslations(locale, ['common', 'inbound_order', 'menu']);
  } catch (error) {
    console.error('Error ', error);
  }
};

const Main = (props: any) => {
  // Values  ----------------------------------------------------
  const { inboundOrder, type, id, refetchOrder } = props;
  const qtyPrecision = parseFloat(process.env.NEXT_QTY_PRECISION || '0');
  const defaultTotal = {
    subtotal: 0,
    total: 0,
    tax: 0,
    shipping_fee: 0,
  };
  const display = React.useRef('none');

  // Atoms ----------------------------------------------------
  const [openItemModal, setOpenItemModal] = useAtom(openItemModalAtom);
  const [openVendorModal, setOpenVendorModal] = useAtom(openVendorModalAtom);
  const [storeInfo] = useAtom(storeInfoAtomS);
  const [multiUnit, setMultiUnit] = useAtom(orderMultiUnitAtomS);
  const [orderExtendInfo, setOrderExtendInfo] = useAtom(orderExtendInfoAtomS);
  // UseRef --------------------------------
  const targetRef = useRef<HTMLDivElement>(null);
  // UseState  ----------------------------------------------------
  const [itemListDatas, setItemListDatas] = useState<any[]>([]);
  const [zonesOptions, setZonesOptions] = useState();
  const [shelfOptions, setShelfOptions] = useState();
  const [binOptions, setBinOptions] = useState();
  const [defaultFormDate, setDefaultFormDate] = useState<any>();
  const [orderTotal, setOrderTotal] = useState<any>(defaultTotal);
  const [confirmModalShow, setConfirmModalShow] = useState(false);
  const [voidConfirmModalShow, setVoidConfirmModalShow] = useState(false);
  const [isVoid, setIsVoid] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [orderSeqNo, setOrderSeqNo] = useState('');
  const [showFooter, setShowFooter] = useState(true);
  const [showItemBar, setShowItemBar] = useState(false);
  const [showOwnItemNotice, setShowOwnItemNotice] = useState(false);
  const [searchItemProps, setSearchItemProps] = useState({
    isActive: true,
    vendorId: undefined,
  });
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

  // Hooks  ---------------------------------------------------------
  const { t } = useTranslation('inbound_order'); // 加载 xxx.json 翻译文件
  const { t: t0 } = useTranslation('common'); // 加载 xxx.json 翻译文件
  const routes = useRouter();
  const clearAllAtom = useClearAllAtom();
  const { mutate: getMe, data: me, isLoading: isLoadingMe, isMe } = useMe();

  const { data: vendorsData, refetch: refetchVendor } = useGetAllVendors({
    type: 1,
    isActive: true,
  });

  const { data: warehouseData } = useGetWarehouse({ isActive: true });

  const { options: unitOptions } = useGetAllUnits({ isActive: true });

  const {
    mutate: getItemOptions,
    options: allItemsOptions,
    isLoading: isLoadingAllItemsOptions,
    serverError: allItemsOptionsDataError,
  } = useGetAllItems();

  const {
    mutate: getLocation,
    data: locationData,
    isLoading: isLoadingLocationData,
    serverError: locationDataError,
  } = useGetZonesByWarehouse();

  const {
    mutate: pdfOrder,
    data: orderPdfData,
    isLoading: isLoadingOrderPdf,
    serverError: pdfOrderError,
  } = usePdfInboundOrder();

  const {
    mutate: calculateOrder,
    data: calculatedData,
    isLoading: isLoadingCalculate,
    serverError: calculateOrderError,
  } = useCalculateInboundOrder();

  const {
    mutate: createOrder,
    data: createdOrderRes,
    isLoading: isLoadingCreateOrder,
    serverError: createOrderError,
  } = useCreateInboundOrder();

  const {
    mutate: updateOrder,
    data: updateOrderRes,
    isLoading: isLoadingUpdateOrder,
    serverError: updateOrderError,
  } = useUpdateInboundOrder();

  const {
    mutate: approveOrder,
    data: approveOrderRes,
    isLoading: isLoadingApproveOrder,
    serverError: approveOrderError,
  } = useApproveOrder();

  const {
    mutate: voidOrder,
    data: voidOrderRes,
    isLoading: isLoadingVoidOrder,
    serverError: voidOrderError,
  } = useVoidOrder();

  const {
    mutate: searchLogs,
    data: logsRes,
    isLoading: isLogsRes,
    serverError: searchLogsError,
  } = useSearchLog();

  // Use Effect  ----------------------------------------------------
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

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (searchItemProps) {
      getItemOptions(searchItemProps);
    }
  }, [searchItemProps]);

  useEffect(() => {
    if (orderPdfData) {
      //@ts-ignore
      const blob = new Blob([orderPdfData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  }, [orderPdfData]);

  useEffect(() => {
    if (openVendorModal === false) {
      refetchVendor();
    }
  }, [openVendorModal]);

  useEffect(() => {
    if (defaultFormDate) {
      setDefaultWarehouseAndVendor();
    }

    if (warehouseData) {
      setDefaultWarehouse();
    }

    if (vendorsData) {
      setDefaultVendor();
    }
  }, [defaultFormDate, warehouseData, vendorsData, ,]);

  // **calculatedData 不可放到依赖数组上合并写会触发重置仓库和vendor
  useEffect(() => {
    if (calculatedData) {
      if (calculatedData?.code === 0) {
        setItemListDatas(calculatedData.data.itemlistDatas);
        setOrderTotal({ ...calculatedData.data.total });
      } else {
        setOrderTotal(defaultTotal);
      }
    }
  }, [calculatedData]);

  // [***Update***Begin***] 模式下格式化加载进货单内容
  useEffect(() => {
    if (inboundOrder?.data !== null && inboundOrder?.data !== undefined) {
      processInboundOrderData(inboundOrder.data);
      getLocation({ warehouseId: inboundOrder.data.warehouse_id });
      getItemOptions({ isActive: true, vendorId: inboundOrder.vendor_id });
    } else {
      setDefaultDate();
    }
  }, [inboundOrder]);
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
      if (approveOrderRes.data) {
        toast.success(t('toast_approve_success'), toastOptions);
        refetchOrder();
      }
    }
  }, [approveOrderRes]);

  // Function ------------------------------------------------
  const handleMultiUnitChange = (event: any, checked: boolean) => {
    // 更新状态
    setMultiUnit(checked);
  };
  const handleExtendInfoChange = (event: any, checked: boolean) => {
    // 更新状态
    setOrderExtendInfo(checked);
  };

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
        routes.push('/inbound/create');
      } else {
        routes.push(`/inbound/${response.data.id}`);
        if (!isCreate) refetchOrder(); // 如果是更新操作则重新获取订单数据
      }
      // 根据创建或更新操作显示不同的成功提示
      toast.success(
        isCreate ? t('toast_created_success') : t('toast_update_success'),
        toastOptions,
      );
    } else if (response && response?.code > 0) {
      toast.error(`Save failed: ${response.data}`, toastOptions);
    } else if (!_.isEmpty(error)) {
      toast.error(error || 'An unknown error occurred', toastOptions);
    }
  };

  // 提取入库单数据处理函数
  const processInboundOrderData = (data: any) => {
    // 设置订单编号和状态
    setOrderSeqNo(data.seq_order_no);
    setIsApproved(data.is_approved);
    setIsVoid(data.isVoid);

    // 格式化数据
    // const purchaseItems = formatPurOrderDetailDataForEdit(data.purchaseItems);
    const orderHeader = formatInboundOrderHeaderForEdit(data);
    const orderDetail = formatInboundOrderDetailForEdit(
      data.inboundOrderDetail,
    );

    const total: ItotalAmount = orderHeader.total as unknown as ItotalAmount;
    const orderForm = { ...orderHeader, items: [...orderDetail] };

    // 更新状态
    setDefaultFormDate(orderForm);
    // setItemListDatas([...purchaseItems]);
    setOrderTotal({ ...total });

    // 搜索日志
    searchLogs({ order_id: data.id });
  };

  const setDefaultDate = () => {
    const today = dayjs().toDate();
    setDefaultFormDate(() => ({
      ...defaultFormDate,
      inbound_date: today,
      received_date: today,
      orderType: orderTypeOptions[0],
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

  function setDefaultVendor() {
    if (type !== 'create') return;

    const defaultVendor = vendorsData?.data.filter((item: any) => {
      return item.isDefault === true;
    });

    if (defaultVendor?.length > 0 && defaultFormDate) {
      defaultFormDate.vendor = defaultVendor[0];
      reset(defaultFormDate);
    }
  }

  // Save & Create 用
  function setDefaultWarehouseAndVendor() {
    if (type !== 'create') return;

    const defaultVendor = vendorsData?.data.filter((item: any) => {
      return item.isDefault === true;
    });

    const defaultWarehouse = warehouseData?.data.filter((item: any) => {
      return item.isDefault === true;
    });

    if (defaultVendor?.length > 0 && defaultFormDate) {
      defaultFormDate.vendor = defaultVendor[0];
    }

    if (defaultWarehouse?.length > 0 && defaultFormDate) {
      defaultFormDate.warehouse = defaultWarehouse[0];
    }
    reset(defaultFormDate);
  }

  //自定义查询  返回boolean类型
  //searchFields.some(...) 用于检查 searchFields 数组中是否有至少一个字段（field）包含 inputValue
  const customFilter = (option: any, inputValue: any) => {
    return customFilterForSelect(option, inputValue);
  };

  const setApproved = () => {
    approveOrder({ id });
  };

  const setVoid = () => {
    voidOrder({ id });
  };

  const clearAllData = () => {
    setItemListDatas([]);
    setValue('items', []);
    setOrderTotal(defaultTotal);
    setDefaultWarehouseAndVendor();
  };

  const calculateByField = () => {
    let isReady = true;
    const pPattern = DECIMAL_GREATER_EQUAL_0_NULLABLE;
    // 使用getValues获取更新后的整个items数组
    const updatedItems = getValues('items');
    if (!updatedItems) {
      return;
    }
    // const watchItems = getValues(); // 获取所有表单字段的值
    const itemsRes = formatItemListData(updatedItems);

    let shipping_fee = getValues('shipping_fee');

    shipping_fee = shipping_fee ? parseFloat(shipping_fee) || 0 : 0;

    if (itemsRes.code === 0 && isReady) {
      calculateOrder({
        shipping_fee,
        inboundOrderDetail: itemsRes.data,
      });
    }
  };

  const onSubmit = (data: any) => {
    const checkRes = checkData(data);
    if (!checkRes) return;
    //-------------------------------------------------
    if (data?.items?.length > 0) {
      //
      const header = {
        ...data,
        vendor_id: data.vendor.value,
        warehouse_id: data.warehouse.value,
        shipping_fee: data.shipping_fee
          ? parseFloat(data.shipping_fee) || 0
          : 0,
        order_type: data.orderType.value,
        discount_amount: data.discount_amount
          ? parseFloat(data.discount_amount) || 0
          : 0,
        discount_rate: data.discount_rate
          ? parseFloat(data.discount_rate) || 0
          : 0,
      };
      const resFormatItemListData = formatItemListData(data.items);

      if (resFormatItemListData.code !== 0) {
        toast.error(resFormatItemListData.msg, toastOptions);
        return false;
      }
      const allData = {
        ...header,
        inboundOrderDetail: resFormatItemListData.data,
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
      toast.error(t('toast_check_items'), toastOptions);
      return;
    }
  };

  const selectItemOnChange = (value: any) => {
    prepend({
      qty_base: 0,
      qty_case: 0,
      price_base: 0,
      tax_rate: 13,
      remark: '',
      item_id: value.id,
      item: { ...value },
      sort_index: 0,
      price_case: 0,
      batchNumber: '',
      expiry_date: null,
      case_exchange_rate: 1,
      case_unit: null,
      zone: {},
      shelf: {},
      bin: {},
    });
  };

  //处理自动拆分
  function handleLocationCodeChange(value: string, index: number) {
    if (locationData?.data) {
      const warehouse = getValues('warehouse');
      if (warehouse) {
        const options = parseLocationCode(
          value,
          locationData?.data,
          storeInfo,
          warehouse.value,
        );

        if (options) {
          const { zone, shelf, bin } = options;
          setValue(`items.${index}.zone`, zone || {});
          setValue(`items.${index}.shelf`, shelf || {});
          setValue(`items.${index}.bin`, bin || {});
        }
      }
    }
  }

  // Compouent -------------------------------------------------

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
                        value={null}
                        // rules={{ required: 'Username is required' }}
                        onChange={(value: any) => {
                          selectItemOnChange(value);
                        }}
                        options={allItemsOptions}
                        isMulti={false}
                        // @ts-ignore
                        rules={{ required: 'Item is required' }}
                        filterOption={customFilter}
                      />
                    </Col>
                    <Col xs={2} lg={1}>
                      <IconButton
                        aria-label="Delete"
                        color="warning"
                        onClick={() => {
                          setOpenItemModal(true);
                        }}
                        //disabled={type === 'create'}
                      >
                        <PostAdd />
                      </IconButton>
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
          {isLoadingCreateOrder || isLoadingUpdateOrder ? 'Saving...' : 'Save'}
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
          {isLoadingCreateOrder || isLoadingCreateOrder ? 'Saving...' : 'New'}
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
          {isLoadingApproveOrder ? 'Approving...' : 'Approve'}
        </Button>
      </ButtonGroup>
    );
  };

  return (
    <div>
      <ItemSearchBar />
      <ItemDialog
        editingItem={undefined}
        showAddBt={false}
        setEditItem={undefined}
      />
      <VendorDialog
        editingItem={undefined}
        showAddBt={false}
        setEditItem={undefined}
      />
      <ConfirmModal
        key={1}
        show={confirmModalShow}
        setShow={setConfirmModalShow}
        fun={() => {
          setApproved();
          setConfirmModalShow(false);
        }}
        info={{
          title: t('md_approve_confirm_title'),
          body: t('md_approve_confirm_body'),
          buttonName: t('md_approve_confirm_button'),
        }}
      />
      <ConfirmModal
        key={2}
        show={voidConfirmModalShow}
        setShow={setVoidConfirmModalShow}
        fun={() => {
          setVoid();
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
              {inboundOrder?.data?.order_no
                ? inboundOrder?.data?.order_no
                : 'Inbound Order'}
              {/* {orderSeqNo !== '' ? convertInboundOrderSeqNo(orderSeqNo) : ''} */}
            </span>
            {isApproved && !isVoid && (
              <>
                <span className="badge tx-16 badge-pill bg-indigo  mg-l-10 mg-r-20">
                  {t('approved')}
                </span>
              </>
            )}
            {isVoid && (
              <span className="badge tx-16 badge-pill bg-danger  mg-l-10 mg-r-20">
                Void
              </span>
            )}
          </div>
        </div>
        {type !== 'create' && (
          <Row>
            {/* <div className=" ">
              <Button
                size="sm"
                startDecorator={<Dangerous />}
                color="danger"
                variant="soft"
                onClick={() => {
                  setVoidConfirmModalShow(true);
                }}
                disabled={type === 'create'}
              >
                {isLoadingApproveOrder ? 'Void...' : 'Void'}
              </Button>
            </div> */}
            <div className=" bd-s pd-l-10 mg-r-10">
              <Button
                size="sm"
                startDecorator={<Print />}
                color="primary"
                variant="soft"
                onClick={() => {
                  const pdfDataParams = formatPdfData(inboundOrder?.data);
                  //@ts-ignore
                  pdfDataParams.storeImageUrl = storeInfo?.logo_url;
                  pdfOrder(pdfDataParams);
                }}
                disabled={type === 'create'}
              >
                {isLoadingOrderPdf ? 'Printing...' : 'Print'}
              </Button>
            </div>
          </Row>
        )}
        <Row>{!isApproved && !showFooter && <SaveButtonGroup />}</Row>
        <div className="justify-content-center mt-2">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item
              className="breadcrumb-item tx-15"
              href="/purchase-order/order-list"
            >
              {t('Inbound Order')}
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
                    {/* vendor */}
                    <Col
                      md={3}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 200 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>
                          <a
                            onClick={() => {
                              setOpenVendorModal(true);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {t('lb_vendor')}
                            <span className=" text-success">{t('lb_new')}</span>
                          </a>
                        </Form.Label>
                        <>
                          {vendorsData?.data && (
                            <div style={{ zIndex: 892 }}>
                              <SelectPro
                                key="vendor"
                                name="vendor"
                                control={control}
                                defaultValue={undefined}
                                options={vendorsData.data}
                                isMulti={false}
                                rules={{ required: 'Vendor is required' }}
                                filterOption={undefined}
                                isDisabled={false}
                                onChangeHandler={(val: any) => {
                                  if (val.isOnlyOwnItem) {
                                    setShowOwnItemNotice(true);
                                    setSearchItemProps({
                                      isActive: true,
                                      vendorId: val.value,
                                    });
                                  } else {
                                    setShowOwnItemNotice(false);
                                    setSearchItemProps({
                                      isActive: true,
                                      vendorId: undefined,
                                    });
                                  }
                                }}
                                //isDisabled={itemListDatas?.length > 0}
                              />
                            </div>
                          )}
                        </>
                      </Form.Group>
                    </Col>
                    {/* warehouse */}
                    <Col
                      md={3}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 199 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_warehouse')}</Form.Label>
                        {warehouseData?.data && (
                          <SelectPro
                            key="warehouse"
                            name="warehouse"
                            control={control}
                            defaultValue={undefined}
                            options={warehouseData.data}
                            isMulti={false}
                            rules={{ required: 'Warehouse is required' }}
                            filterOption={undefined}
                            isDisabled={false}
                            onChangeHandler={(value: any) => {
                              getLocation({ warehouseId: value.id });
                            }}
                            //isDisabled={itemListDatas?.length > 0}
                          />
                        )}
                      </Form.Group>
                    </Col>
                    {/* orderType */}
                    <Col
                      md={3}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 198 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_order_type')}</Form.Label>
                        <SelectPro
                          key="orderType"
                          name="orderType"
                          control={control}
                          defaultValue={undefined}
                          options={orderTypeOptions}
                          isMulti={false}
                          rules={{ required: 'Order Type is required' }}
                          filterOption={undefined}
                          isDisabled={false}
                          onChangeHandler={undefined}
                          //isDisabled={itemListDatas?.length > 0}
                        />
                      </Form.Group>
                    </Col>
                    {/* invoice_no */}
                    <Col md={3} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_invoice_no')}</Form.Label>
                        <Form.Control
                          {...register('invoice_no')}
                          placeholder="Resource"
                          type="text"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={3} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_batch_number')}</Form.Label>
                        <Form.Control
                          {...register('batch_number')}
                          placeholder="批次号"
                          type="text"
                        />
                      </Form.Group>
                    </Col>
                    <Col
                      xs={12}
                      lg={3}
                      xl={3}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 180 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_inbound_date')}</Form.Label>
                        <InputGroup className="input-group reactdate-pic">
                          <InputGroup.Text className="input-group-text">
                            <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                          </InputGroup.Text>
                          <div className="wd-150">
                            <Datepicker
                              key="inbound_date"
                              name="inbound_date"
                              control={control}
                              isMulti={false}
                              rules={{ required: 'Inbound Date is required' }}
                            />
                          </div>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col
                      xs={12}
                      lg={3}
                      className=" mg-t-10 mg-md-t-0 "
                      style={{ zIndex: 179 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_received_date')}</Form.Label>
                        <InputGroup className="input-group reactdate-pic">
                          <InputGroup.Text className="input-group-text">
                            <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                          </InputGroup.Text>
                          <div className="wd-150">
                            <Datepicker
                              key="received_date"
                              name="received_date"
                              control={control}
                              isMulti={false}
                              rules={{}}
                            />
                          </div>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col xs={6} lg={3} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_shipping_fee')}</Form.Label>
                        <Form.Control
                          {...register('shipping_fee', {
                            required: false,
                            validate: (value: any): any => {
                              var pPattern = DECIMAL_GREATER_EQUAL_0_NULLABLE;

                              if (!pPattern.test(value)) {
                                return 'Value must be a number >= 0';
                              }
                            },
                          })}
                          placeholder="Shipping Fee"
                          type="text"
                          style={{ textAlign: 'right' }}
                          onChange={(e) => {
                            const newVal = e.target.value;
                            // 直接通过setValue更新当前更改的input的值
                            setValue(`shipping_fee`, newVal);
                            calculateByField();
                          }}
                          defaultValue={0}
                          onFocus={(e) => {
                            // 在获得焦点时全选输入框中的内容
                            e.target.select();
                          }}
                        />
                        {errors.shipping_fee && (
                          <Form.Text className="text-danger">
                            {errors.shipping_fee.message as string}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card.Header>
            </Card>
            <div ref={targetRef}></div>
            {/* ----------------------------表明细------------------------------------ */}
            <Card className="card custom-card">
              <Row className="mg-t-10">
                <Stack direction="horizontal" className="mg-l-10  ">
                  <span>{t('multi_unit')}</span>
                  <Switch
                    // rules={{ required: 'Username is required' }}
                    onChange={handleMultiUnitChange}
                    checked={multiUnit}
                  />
                </Stack>
                <Stack direction="horizontal" className="mg-l-10 bd-s ">
                  <span>{t('extend_info')}</span>
                  <Switch
                    // rules={{ required: 'Username is required' }}
                    onChange={handleExtendInfoChange}
                    checked={orderExtendInfo}
                  />
                </Stack>
                {showOwnItemNotice && (
                  <Stack direction="horizontal" className="mg-l-10 bd-s ">
                    <div>
                      <NotificationImportantIcon sx={{ color: '#FFA500' }} />
                      <span className="">{t('vendor_owned_tips')}</span>
                    </div>
                  </Stack>
                )}
              </Row>

              <Card.Body>
                <Stack gap={2}>
                  {allItemsOptions && (
                    <Row className="bg-gray-100 pd-t-6 pd-b-6 ">
                      <Col xs={10} lg={11}>
                        <Select
                          className=""
                          value={null}
                          // rules={{ required: 'Username is required' }}
                          onChange={(value: any) => {
                            selectItemOnChange(value);
                          }}
                          options={allItemsOptions}
                          isMulti={false}
                          // @ts-ignore
                          rules={{ required: 'Item is required' }}
                          filterOption={customFilter}
                        />
                      </Col>
                      <Col xs={2} lg={1}>
                        <IconButton
                          aria-label="Delete"
                          color="warning"
                          onClick={() => {
                            setOpenItemModal(true);
                          }}
                          //disabled={type === 'create'}
                        >
                          <PostAdd />
                        </IconButton>
                      </Col>
                    </Row>
                  )}

                  {fields.map((item: any, index) => {
                    return (
                      <div key={item.id} className="mg-t-6 ">
                        <Stack>
                          <Row className="bg-gray-100 pd-t-4  tx-14 text-orange">
                            <Col md={8} xs={10}>
                              <Stack direction="horizontal" gap={3}>
                                {item.item && (
                                  <span>
                                    {`#${index}-[${item.item.sku}]`}
                                    {' - '}
                                    {item.item.name_localizations.zh || ''}/
                                    {item.item.name_localizations.en}
                                    {' - '}
                                    {item.item.base_unit?.name}
                                    {item.item.total_balance && (
                                      <>
                                        ; {t('itemlb_balance')}:{' '}
                                        <span className="bg-green tx-white pd-4">
                                          {parseFloat(
                                            item.item.total_balance,
                                          ).toFixed(qtyPrecision)}
                                        </span>
                                      </>
                                    )}
                                    {item.item.total_locked_balance > 0 && (
                                      <>
                                        {' '}
                                        Picking:{' '}
                                        <span className="bg-indigo tx-white pd-4">
                                          {parseFloat(
                                            item.item.total_locked_balance,
                                          ).toFixed(qtyPrecision)}
                                        </span>
                                      </>
                                    )}
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
                                {t('itemlb_qty')}
                                {`(>0)`}
                              </Form.Label>
                              <Form.Control
                                {...register(`items.${index}.qty_base`, {
                                  required: true,
                                  validate: (value: any): any => {
                                    var pPattern = DECIMAL_GREATER_THAN_0;

                                    if (!pPattern.test(value)) {
                                      return 'Must be a number and > 0';
                                    }
                                  },
                                })}
                                defaultValue={item.qty_pur}
                                style={{ textAlign: 'right' }}
                                placeholder=""
                                type="text"
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  // 直接通过setValue更新当前更改的input的值
                                  setValue(`items[${index}].qty_base`, newVal);
                                  calculateByField();
                                }}
                                onFocus={(e) => {
                                  // 在获得焦点时全选输入框中的内容
                                  e.target.select();
                                }}
                              />

                              {errors &&
                              Object.keys(errors?.items || {}).length > 0 ? (
                                <>
                                  <Form.Text className="text-danger">
                                    {errors.items &&
                                      // @ts-ignore
                                      errors.items[index]?.qty_base?.message}
                                  </Form.Text>
                                </>
                              ) : (
                                <></>
                              )}
                            </Col>
                            <Col xs={6} md={2} className="  ">
                              <Form.Label htmlFor={`item-${index}`}>
                                {t('itemlb_price_base')}
                              </Form.Label>
                              <Form.Control
                                {...register(`items.${index}.price_base`, {
                                  required: true,
                                  validate: (value: any): any => {
                                    var pPattern =
                                      DECIMAL_GREATER_EQUAL_0_NULLABLE;

                                    if (!pPattern.test(value)) {
                                      return 'Must be a number or > 0';
                                    }
                                  },
                                })}
                                defaultValue={item.price_base}
                                style={{ textAlign: 'right' }}
                                placeholder=""
                                type="text"
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  // 直接通过setValue更新当前更改的input的值
                                  setValue(
                                    `items[${index}].price_base`,
                                    newVal,
                                  );
                                  calculateByField();
                                }}
                                onFocus={(e) => {
                                  // 在获得焦点时全选输入框中的内容
                                  e.target.select();
                                }}
                              />
                              {errors &&
                              Object.keys(errors?.items || {}).length > 0 ? (
                                <>
                                  <Form.Text className="text-danger">
                                    {errors.items &&
                                      // @ts-ignore
                                      errors.items[index]?.price_base?.message}
                                  </Form.Text>
                                </>
                              ) : (
                                <></>
                              )}
                            </Col>
                            <Col xs={6} md={1} className="  ">
                              <Form.Label htmlFor={`item-${index}`}>
                                {t('itemlb_tax_rate')}
                              </Form.Label>
                              <Form.Control
                                {...register(`items.${index}.tax_rate`, {
                                  required: false,
                                  validate: (value: any): any => {
                                    var pPattern =
                                      DECIMAL_GREATER_EQUAL_0_NULLABLE;

                                    if (!pPattern.test(value)) {
                                      return 'Must be a number and >= 0';
                                    }
                                  },
                                })}
                                defaultValue={item.tax_rate}
                                style={{ textAlign: 'right' }}
                                placeholder=""
                                type="text"
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  // 直接通过setValue更新当前更改的input的值
                                  setValue(`items[${index}].tax_rate`, newVal);
                                  calculateByField();
                                }}
                                onFocus={(e) => {
                                  // 在获得焦点时全选输入框中的内容
                                  e.target.select();
                                }}
                              />
                              {errors &&
                              Object.keys(errors?.items || {}).length > 0 ? (
                                <>
                                  <Form.Text className="text-danger">
                                    {errors.items &&
                                      // @ts-ignore
                                      errors.items[index]?.tax_rate?.message}
                                  </Form.Text>
                                </>
                              ) : (
                                <></>
                              )}
                            </Col>
                            <Col xs={6} md={2} className="  ">
                              <Form.Label htmlFor={`item-${index}`}>
                                {t('itemlb_location_code')}
                              </Form.Label>
                              <Form.Control
                                {...register(`items.${index}.locationCode`, {
                                  required: false,
                                })}
                                placeholder=""
                                type="text"
                                onChange={(e) =>
                                  handleLocationCodeChange(
                                    e.target.value,
                                    index,
                                  )
                                }
                                onFocus={(e) => {
                                  // 在获得焦点时全选输入框中的内容
                                  e.target.select();
                                }}
                              />
                            </Col>
                          </Row>
                          {multiUnit && (
                            <Row className="bg-gray-100 pd-b-6">
                              <Col
                                md={2}
                                className=" mg-t-10 mg-md-t-0"
                                style={{ zIndex: 1891 }}
                              >
                                <Form.Group className="form-group">
                                  <Form.Label>
                                    {t('itemlb_case_unit')}
                                  </Form.Label>
                                  {warehouseData?.data && (
                                    <SelectPro
                                      key={`items.${index}.case_unit`}
                                      name={`items.${index}.case_unit`}
                                      control={control}
                                      defaultValue={undefined}
                                      options={unitOptions}
                                      isMulti={false}
                                      rules={{}}
                                      filterOption={undefined}
                                      isDisabled={false}
                                      onChangeHandler={undefined}
                                      //isDisabled={itemListDatas?.length > 0}
                                    />
                                  )}
                                </Form.Group>
                              </Col>
                              <Col xs={6} md={2} className=" pd-b-6 ">
                                <Form.Label htmlFor={`item-${index}`}>
                                  {t('itemlb_qty_case')}
                                </Form.Label>
                                <Form.Control
                                  {...register(`items.${index}.qty_case`, {
                                    required: true,
                                    validate: (value: any): any => {
                                      var pPattern = DECIMAL_GREATER_THAN_0;
                                      const checkCaseUnit = getValues(
                                        `items.${index}.case_unit`,
                                      );

                                      if (checkCaseUnit) {
                                        if (!pPattern.test(value)) {
                                          return 'Must be a number and > 0';
                                        }
                                      }
                                    },
                                  })}
                                  defaultValue={item.qty_case}
                                  style={{ textAlign: 'right' }}
                                  placeholder=""
                                  type="text"
                                  onChange={(e) => {
                                    const newVal = e.target.value;
                                    // 直接通过setValue更新当前更改的input的值
                                    setValue(
                                      `items[${index}].qty_case`,
                                      newVal,
                                    );
                                    calculateByField();
                                  }}
                                  onFocus={(e) => {
                                    // 在获得焦点时全选输入框中的内容
                                    e.target.select();
                                  }}
                                />

                                {errors &&
                                Object.keys(errors?.items || {}).length > 0 ? (
                                  <>
                                    <Form.Text className="text-danger">
                                      {errors.items &&
                                        // @ts-ignore
                                        errors.items[index]?.qty_case?.message}
                                    </Form.Text>
                                  </>
                                ) : (
                                  <></>
                                )}
                              </Col>
                              {/* INV Unit Price */}
                              <Col xs={6} md={2} className="  ">
                                <Form.Label htmlFor={`item-${index}`}>
                                  {t('itemlb_price_case')}
                                </Form.Label>
                                <Form.Control
                                  {...register(`items.${index}.price_case`, {
                                    required: true,
                                    validate: (value: any): any => {
                                      var pPattern =
                                        DECIMAL_GREATER_EQUAL_0_NULLABLE;
                                      const checkCaseUnit = getValues(
                                        `items.${index}.case_unit`,
                                      );
                                      if (checkCaseUnit) {
                                        if (!pPattern.test(value)) {
                                          return 'Must be a number  >= 0';
                                        }
                                      }
                                    },
                                  })}
                                  defaultValue={item.price_case}
                                  style={{ textAlign: 'right' }}
                                  placeholder=""
                                  type="text"
                                  onChange={(e) => {
                                    const newVal = e.target.value;
                                    // 直接通过setValue更新当前更改的input的值
                                    setValue(
                                      `items[${index}].price_case`,
                                      newVal,
                                    );
                                    calculateByField();
                                  }}
                                  onFocus={(e) => {
                                    // 在获得焦点时全选输入框中的内容
                                    e.target.select();
                                  }}
                                />
                                {errors &&
                                Object.keys(errors?.items || {}).length > 0 ? (
                                  <>
                                    <Form.Text className="text-danger">
                                      {errors.items &&
                                        // @ts-ignore
                                        errors.items[index]?.price_case
                                          ?.message}
                                    </Form.Text>
                                  </>
                                ) : (
                                  <></>
                                )}
                              </Col>
                              <Col xs={6} md={2} className="  ">
                                <Form.Label htmlFor={`item-${index}`}>
                                  {t('itemlb_case_exchange_rate')}
                                </Form.Label>
                                <Form.Control
                                  {...register(
                                    `items.${index}.case_exchange_rate`,
                                    {
                                      required: true,
                                      validate: (value: any): any => {
                                        var pPattern = DECIMAL_GREATER_THAN_0;
                                        const checkCaseUnit = getValues(
                                          `items.${index}.case_unit`,
                                        );
                                        if (checkCaseUnit) {
                                          if (!pPattern.test(value)) {
                                            return 'Must be a number and > 0';
                                          }
                                        }
                                      },
                                    },
                                  )}
                                  defaultValue={item.price_case}
                                  style={{ textAlign: 'right' }}
                                  placeholder=""
                                  type="text"
                                  onChange={(e) => {
                                    const newVal = e.target.value;
                                    // 直接通过setValue更新当前更改的input的值
                                    setValue(
                                      `items[${index}].case_exchange_rate`,
                                      newVal,
                                    );
                                    calculateByField();
                                  }}
                                  onFocus={(e) => {
                                    // 在获得焦点时全选输入框中的内容
                                    e.target.select();
                                  }}
                                />
                                {errors &&
                                Object.keys(errors?.items || {}).length > 0 ? (
                                  <>
                                    <Form.Text className="text-danger">
                                      {errors.items &&
                                        // @ts-ignore
                                        errors.items[index]?.case_exchange_rate
                                          ?.message}
                                    </Form.Text>
                                  </>
                                ) : (
                                  <></>
                                )}
                              </Col>
                            </Row>
                          )}
                          {orderExtendInfo && (
                            <Row className="bg-gray-100 pd-b-6">
                              <Col xs={6} lg={2} className="  ">
                                <Form.Label htmlFor={`item-${index}`}>
                                  {t('itemlb_batch_number')}
                                </Form.Label>
                                <Form.Control
                                  {...register(`items.${index}.batchNumber`)}
                                  defaultValue={item.batchNumber}
                                  placeholder=""
                                  type="text"
                                />
                              </Col>
                              <Col
                                xs={12}
                                lg={2}
                                className=" mg-t-10 mg-md-t-0 "
                                style={{ zIndex: 1893 }}
                              >
                                <Form.Group className="form-group">
                                  <Form.Label>
                                    {t('itemlb_expiry_date')}
                                  </Form.Label>

                                  <Datepicker
                                    key={`items.${index}.expiry_date`}
                                    name={`items.${index}.expiry_date`}
                                    control={control}
                                    isMulti={false}
                                    rules={{}}
                                  />
                                </Form.Group>
                              </Col>
                              {locationData?.data && (
                                <Col
                                  md={2}
                                  className=" mg-t-10 mg-md-t-0"
                                  style={{ zIndex: 1892 }}
                                >
                                  <Form.Group className="form-group">
                                    <Form.Label>{t('itemlb_zone')}</Form.Label>
                                    <SelectPro
                                      key={`items.${index}.zone`}
                                      name={`items.${index}.zone`}
                                      control={control}
                                      defaultValue={undefined}
                                      options={zonesOptions}
                                      isMulti={false}
                                      rules={{}}
                                      filterOption={undefined}
                                      isDisabled={false}
                                      onChangeHandler={(val: any) => {
                                        setValue(`items.${index}.shelf`, {});
                                        setValue(`items.${index}.bin`, {});
                                      }}
                                      handleMenuOpen={() => {
                                        setZonesOptions(
                                          getZonesOptions(locationData.data),
                                        );
                                      }}
                                    />
                                  </Form.Group>
                                </Col>
                              )}

                              {locationData?.data && (
                                <Col
                                  md={2}
                                  className=" mg-t-10 mg-md-t-0"
                                  style={{ zIndex: 1891 }}
                                >
                                  <Form.Group className="form-group">
                                    <Form.Label>{t('itemlb_shelf')}</Form.Label>
                                    <SelectPro
                                      key={`items.${index}.shelf`}
                                      name={`items.${index}.shelf`}
                                      control={control}
                                      defaultValue={undefined}
                                      options={shelfOptions}
                                      isMulti={false}
                                      rules={{}}
                                      filterOption={undefined}
                                      isDisabled={false}
                                      handleMenuOpen={() => {
                                        const zone = getValues(
                                          `items.${index}.zone`,
                                        );

                                        if (zone) {
                                          const options = getShelvesByZone(
                                            zone.value,
                                            locationData.data,
                                          );

                                          setShelfOptions(options);
                                        }
                                      }}
                                    />
                                  </Form.Group>
                                </Col>
                              )}

                              {locationData?.data && (
                                <Col
                                  md={2}
                                  className=" mg-t-10 mg-md-t-0"
                                  style={{ zIndex: 1890 }}
                                >
                                  <Form.Group className="form-group">
                                    <Form.Label>{t('itemlb_bin')}</Form.Label>
                                    <SelectPro
                                      key={`items.${index}.shelf`}
                                      name={`items.${index}.bin`}
                                      control={control}
                                      defaultValue={undefined}
                                      options={binOptions}
                                      isMulti={false}
                                      rules={{}}
                                      filterOption={undefined}
                                      isDisabled={false}
                                      onChangeHandler={undefined}
                                      handleMenuOpen={() => {
                                        const shelf = getValues(
                                          `items.${index}.shelf`,
                                        );
                                        if (shelf) {
                                          const options = getBinsByShelf(
                                            shelf.value,
                                            locationData.data,
                                          );
                                          setBinOptions(options);
                                        }
                                      }}
                                    />
                                  </Form.Group>
                                </Col>
                              )}
                              <Col xs={6} lg={7} className="  ">
                                <Form.Label htmlFor={`item-${index}`}>
                                  {t('itemlb_remarks')}
                                </Form.Label>
                                <Form.Control
                                  {...register(`items.${index}.remark`)}
                                  defaultValue={item.remark}
                                  placeholder=""
                                  type="text"
                                />
                              </Col>
                            </Row>
                          )}
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
                <Card.Title>{t('lb_amount')}</Card.Title>
                <Card.Body>
                  <Stack direction="vertical" gap={1}>
                    <Row>
                      <Col
                        md={6}
                        className="align-self-end"
                        style={{ textAlign: 'right' }}
                      >
                        {t('lb_subtotal')}:
                      </Col>
                      <Col md={6} style={{ textAlign: 'right', fontSize: 14 }}>
                        {orderTotal.subtotal?.toFixed(2)}
                      </Col>
                    </Row>

                    <Row>
                      <Col
                        md={6}
                        className="align-self-end"
                        style={{ textAlign: 'right' }}
                      >
                        {t('lb_tax')}:
                      </Col>
                      <Col md={6} style={{ textAlign: 'right', fontSize: 14 }}>
                        {orderTotal.tax?.toFixed(2)}
                      </Col>
                    </Row>

                    {orderTotal.shipping_fee > 0 && (
                      <Row>
                        <Col
                          md={6}
                          className="align-self-end "
                          style={{ textAlign: 'right' }}
                        >
                          {t('lb_shipping_fee')}:
                        </Col>
                        <Col
                          md={6}
                          style={{ textAlign: 'right', fontSize: 14 }}
                        >
                          <span className="">{orderTotal.shipping_fee}</span>
                        </Col>
                      </Row>
                    )}

                    <Row className="bd-y">
                      <Col
                        md={6}
                        className="align-self-center "
                        style={{ textAlign: 'right' }}
                      >
                        {t('lb_total')}:
                      </Col>
                      <Col md={6} style={{ textAlign: 'right', fontSize: 20 }}>
                        {orderTotal.total?.toFixed(2)}
                      </Col>
                    </Row>
                  </Stack>
                </Card.Body>
              </Card.Header>
            </Card>

            <Card className="card custom-card">
              <Card.Header className="card-header">
                <Card.Title>{t('lb_remarks')}</Card.Title>
                <Card.Body>
                  <Stack direction="vertical" gap={3}>
                    <textarea
                      {...register('remark')}
                      className="form-control "
                      placeholder={t('ph_remarks')}
                      rows={2}
                    />
                    <textarea
                      {...register('highlight')}
                      className="form-control "
                      placeholder={t('ph_highlight')}
                      rows={2}
                    />
                    <textarea
                      {...register('print_remark')}
                      className="form-control "
                      placeholder={t('ph_print_remark')}
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
                    <h3 className="card-title mb-2">{t('lb_audit')}</h3>
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
const Inbound = (props: any) => {
  console.log('🚀 ~ Inbound ~ props:', props);
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
  const { data: inboundOrder, refetch } = useGetInboundOrderById({ id });

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

  const refreshData = () => {
    router.replace(router.asPath); // 替换当前路径并重新触发 getServerSideProps
  };

  useEffect(() => {
    if (!inboundOrder) return;
    if (!(inboundOrder as { data: any }).data) {
      routes.push('/inbound/create');
    }
  }, [inboundOrder]);

  return (
    <>
      {isMe && (
        <>
          {type === 'create' && (
            <Main type={type} inboundOrder={inboundOrder} id={id} />
          )}

          {type === 'edit' &&
          inboundOrder &&
          (inboundOrder as { data: any }).data ? (
            <Main
              type={type}
              inboundOrder={inboundOrder}
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

Inbound.layout = 'Contentlayout';

export default Inbound;
