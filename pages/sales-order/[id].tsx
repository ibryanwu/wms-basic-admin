'use client';
// @ts-nocheck
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MutationCache } from 'react-query';
import Select from 'react-select';
import { Divider, IconButton } from '@mui/material';

import {
  Save,
  PlaylistAddCheck,
  CreateNewFolder,
  CloudSync,
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
  useCalculateSalesOrder,
  useCreateSalesOrder,
  useGetSalesOrderById,
  usePdfSalesOrder,
  useUpdateSalesOrder,
  useUpdateSalesOrderStatus,
} from '@/rest/sales';
import {
  DECIMAL_GREATER_EQUAL_0_NULLABLE,
  DECIMAL_GREATER_THAN_0,
  DECIMAL_GREATER_THAN_0_NULLABLE,
  DECIMAL_OR_0,
  NUMERIC_GREATER_OR_LESS_0,
} from '@/lib/constants';
import { getStoreLogoUrl } from '@/lib/sys';
import { useAtom } from 'jotai';
import {
  itemListForSalesAtom,
  openItemModalAtom,
  openVendorModalAtom,
  storeInfoAtomS,
  useClearAllAtom,
} from '@/stores/atom';
import { set, useFieldArray, useForm } from 'react-hook-form';
import {
  convertSalesOrderSeqNo,
  defaultOrderHeaderData,
  formatPdfData,
  formatSalesOrderDetailDataForEdit,
  formatSalesOrderDetailForEdit,
  formatSalesOrderHeaderDataForEdit,
} from '@/service/sales';
import { Button, ButtonGroup } from '@mui/joy';
import { useGetAllVendors } from '@/rest/vendor';
import { useGetAllPaymentMethod, useGetAllPaymentStatus } from '@/rest/payment';

import { useMe } from '@/rest/auth';
import { toast } from 'react-toastify';
import { ItotalAmount } from '@/types/sales';
import { useGetWarehouse, useSearchLog } from '@/rest/inv';
import { ConfirmModal } from '@/component-lib/modal/confirm-modal';
import { generateShortUUID } from '@/utils/public';
import { ItemDialog } from '@/component-lib/modal/meta/ItemDialog';
import { VendorDialog } from '@/component-lib/modal/meta/VendorDialog';
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
  return getStaticTranslations(locale, [
    'common',
    'sales_order',
    'menu',
    'items',
    'vendor',
  ]);
}

const Main = (props: any) => {
  // Values  ----------------------------------------------------
  const { salesOrder, type, id, refetchOrder } = props;
  const qtyPrecision = parseFloat(process.env.NEXT_QTY_PRECISION || '0');

  const defaultTotal = {
    subtotal: 0,
    total: 0,
    tax: 0,
    discount_rate: 0,
    discount_amount: 0,
    promotion_amount: 0,
    shipping_fee: 0,
  };

  // Atoms ----------------------------------------------------
  const [itemListDatas, setItemListDatas] = useAtom(itemListForSalesAtom);
  const [openItemModal, setOpenItemModal] = useAtom(openItemModalAtom);
  const [openVendorModal, setOpenVendorModal] = useAtom(openVendorModalAtom);
  const [storeInfo] = useAtom(storeInfoAtomS);

  // UseState  ----------------------------------------------------
  const [defaultFormDate, setDefaultFormDate] = useState<any>();
  const [orderTotal, setOrderTotal] = useState<any>(defaultTotal);
  const [confirmModalShow, setConfirmModalShow] = useState(false);
  const [voidConfirmModalShow, setVoidConfirmModalShow] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isVoid, setIsVoid] = useState(false);
  const [orderSeqNo, setOrderSeqNo] = useState('');
  const [showFooter, setShowFooter] = useState(true);
  const [showItemBar, setShowItemBar] = useState(false);
  const [allItemsOptions, setallItemsOptions] = useState([]);
  const saveType = useRef('');

  // UseRef --------------------------------
  const targetRef = useRef<HTMLDivElement>(null);
  // Use-Form ----------------------------------------------------------------
  const {
    register,
    handleSubmit: handleSubmitMain,
    formState: { errors },
    getValues,
    reset,
    setValue,
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
  const { t: t0 } = useTranslation('common');
  const { t } = useTranslation('sales_order');
  const routes = useRouter();
  const clearAllAtom = useClearAllAtom();
  const { mutate: getMe, data: me, isLoading: isLoadingMe, isMe } = useMe();
  const { options: paymentMethodOptions } = useGetAllPaymentMethod();
  const { options: paymentStatusOptions } = useGetAllPaymentStatus();
  const { data: vendorsData, refetch: refetchVendor } = useGetAllVendors({
    type: 2,
    isActive: true,
  });
  // const { options: allItemsOptions, refetch } = useGetAllItems({
  //   isActive: true,
  // });
  const { data: warehouseData } = useGetWarehouse({ isActive: true });
  const {
    mutate: pdfOrder,
    data: orderPdfData,
    isLoading: isLoadingOrderPdf,
  } = usePdfSalesOrder();
  const {
    mutate: calculateOrder,
    data: calculatedData,
    isLoading: isLoadingCalculate,
  } = useCalculateSalesOrder();
  const {
    mutate: createOrder,
    data: createdOrderRes,
    isLoading: isLoadingCreateOrder,
  } = useCreateSalesOrder();
  const {
    mutate: updateOrder,
    data: updateOrderRes,
    isLoading: isLoadingUpdateOrder,
  } = useUpdateSalesOrder();

  const {
    mutate: updateStatus,
    data: updateStatusRes,
    isLoading: isUpdateStatusRes,
  } = useUpdateSalesOrderStatus();

  const {
    mutate: searchLogs,
    data: logsRes,
    isLoading: isLogsRes,
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
    if (openItemModal === false) {
      // refetch();
    }
  }, [openItemModal]);

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
  }, [defaultFormDate]);

  useEffect(() => {
    setDefaultWarehouse();
  }, [warehouseData]);

  useEffect(() => {
    setDefaultVendor();
  }, [vendorsData]);

  // [***Update***] 模式下格式化加载销货单内容
  useEffect(() => {
    if (salesOrder?.data !== null && salesOrder?.data !== undefined) {
      const { data } = salesOrder;

      setOrderSeqNo(data.seq_order_no);
      setIsApproved(data.is_approved);
      setIsVoid(data.isVoid);

      const salesItems = formatSalesOrderDetailDataForEdit(
        salesOrder.data.salesOrderItems,
      );

      const orderHeader = formatSalesOrderHeaderDataForEdit(data);
      const orderDetail = formatSalesOrderDetailForEdit(data);

      const total: ItotalAmount = orderHeader.total as unknown as ItotalAmount;
      const orderForm = { ...orderHeader, items: [...orderDetail] };

      setDefaultFormDate(orderForm);
      setItemListDatas([...salesItems]);
      setOrderTotal({ ...total });
      //search log
      searchLogs({ order_id: salesOrder.data.id });
    } else {
      let today = dayjs().toDate();
      setDefaultFormDate({ ...defaultFormDate, sales_order_date: today });
    }
  }, [salesOrder]);

  useEffect(() => {
    getMe();

    if (calculatedData) {
      if (calculatedData?.code === 0) {
        setItemListDatas(calculatedData.data.itemlistDatas);
        setOrderTotal({ ...calculatedData.data.total });
      } else {
        setOrderTotal(defaultTotal);
      }
    }
  }, [calculatedData]);

  useEffect(() => {
    if (createdOrderRes?.code === 0) {
      if (saveType.current === 'savenew') {
        clearAllAtom();
        clearAllData();
        routes.push('/sales-order/create');
      } else {
        routes.push(`/sales-order/${createdOrderRes.data}`);
        toast.success(t('toast_created_success'));
      }
    } else {
      toast.error(createdOrderRes?.msg);
    }
  }, [createdOrderRes]);

  useEffect(() => {
    if (updateOrderRes?.code === 0) {
      if (saveType.current === 'savenew') {
        routes.push('/sales-order/create');
      } else {
        routes.push(`/sales-order/${updateOrderRes.data}`);
        refetchOrder();
      }

      toast.success(t('toast_update_success'));
    } else {
      toast.error(createdOrderRes?.msg);
    }
  }, [updateOrderRes]);

  useEffect(() => {
    if (updateStatusRes?.code === 0) {
      if (updateStatusRes.data) {
        toast.success(t('toast_status_success'));
        refetchOrder();
      }
    }
  }, [updateStatusRes]);

  // Function ------------------------------------------------

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
    if (inputValue.length > 2) {
      const searchFields = [option.data.search];
      return searchFields.some((field) => {
        const keywords = inputValue.split('|');
        // 检查是否同时包含两个关键字

        const containsMutliKeywords = keywords.every((keyword: any) =>
          field
            .toLowerCase()
            .replace(/\s/g, '')
            .includes(keyword.toLowerCase().replace(/\s/g, '')),
        );

        return containsMutliKeywords;
      });
    }
    return false; //禁止一上来就显示下拉
  };
  const setApproved = () => {
    updateStatus({ id: id, isApproved: true });
  };

  const setVoid = () => {
    updateStatus({ id: id, isVoid: true });
  };
  const clearAllData = () => {
    setItemListDatas([]);
    setValue('items', []);
    setOrderTotal(defaultTotal);
    setDefaultWarehouseAndVendor();
  };

  const calculate = () => {
    if (itemListDatas.length > 0) {
      let discount_rate = getValues('discount_rate');
      if (discount_rate === '') discount_rate = '0';
      calculateOrder({ discount_rate, discount_amount: '0', itemListDatas });
    }
  };
  const calculateByField = () => {
    let isReady = true;
    const pPattern = DECIMAL_GREATER_EQUAL_0_NULLABLE;
    // 使用getValues获取更新后的整个items数组
    const updatedItems = getValues('items');
    // const watchItems = getValues(); // 获取所有表单字段的值
    const itemsRes = formatItemListData({
      items: updatedItems,
    });

    let discount_rate = getValues('discount_rate');
    let shipping_fee = getValues('shipping_fee');
    if (discount_rate === '') discount_rate = '0';
    if (shipping_fee && !pPattern.test(shipping_fee)) {
      isReady = false;
    } else if (!shipping_fee) {
      shipping_fee = 0;
    }
    if (itemsRes.code === 0 && isReady) {
      calculateOrder({
        discount_rate,
        discount_amount: '0',
        shipping_fee,
        itemListDatas: itemsRes.data,
      });
    }
  };

  const formatItemListData = (data: any) => {
    const pPatternQty = NUMERIC_GREATER_OR_LESS_0;
    const pPatternPrice = DECIMAL_GREATER_THAN_0;
    const pPatternTax = DECIMAL_GREATER_EQUAL_0_NULLABLE;

    const itemListDatasTemp: any[] = [];
    const { items } = data;
    let code = 0;
    if (!items) return { code: 1, data: [], msg: 'No items' };

    const currentItem = [...data.items];
    if (currentItem.length > 0) {
      currentItem.forEach((item: any, index: number) => {
        if (!item.detail) {
          code++;
          return;
        }
        let temp: any = {
          item: { ...item.detail },
          exchange_rate: 1,
          tax_rate: item.tax_rate || '0',
          qty_sales: item.qty_sales || '0',
          price_sales: item.price_sales || '0',
          received_qty: item.qty_pur || '0',
          qty_base: item.qty_sales || '0',
          price_base: item.price_sales || '0',
          is_partial_received: false,
          remark: item.remark || '',
          promotional_source_items: undefined,
          is_promotional_item: false,
          total: 0,
          base_unit_id: { value: item.detail.base_unit.id },
          sales_unit_id: { value: item.detail.sales_unit.id },
          discount_rate: 0,
          discount_amount: 0,
          cost_base: 0,
          value: item.detail.id,
          sort_index: index,
        };
        if (
          !pPatternQty.test(temp.qty_sales) ||
          !pPatternPrice.test(temp.price_sales) ||
          !pPatternTax.test(temp.tax_rate)
        ) {
          code++;
        }
        temp.row_uuid = generateShortUUID();

        itemListDatasTemp.push({ ...temp });
      });
    } else {
      code++;
    }
    if (code === 0) {
      return { code, data: itemListDatasTemp, msg: 'success' };
    } else {
      return { code, data: [], msg: 'Items invalid' };
    }
  };
  const onSubmit = (data: any) => {
    //
    if (data?.items?.length > 0) {
      //
      const header = {
        ...data,
        discount_rate: data.discount_rate || 0,
        discount_amount: data.discount_amount || 0,
        vendor_id: data.vendor.value,
        warehouse_id: data.warehouse.value,
        payment_method_id: data.payment_method?.value || '',
        payment_status_id: data.payment_status?.value || '',
        shipping_fee: data.shipping_fee || 0,
      };
      const resFormatItemListData = formatItemListData(data);

      if (resFormatItemListData.code !== 0) {
        toast.error(resFormatItemListData.code);
        return false;
      }
      const allData = { header: header, items: resFormatItemListData.data };

      if (type === 'create') {
        // @ts-ignore
        createOrder(allData);
      }
      if (type === 'edit') {
        // @ts-ignore
        updateOrder(allData);
      }
    } else {
      toast.error(t('toast_check_items'));
      return;
    }
    //
  };
  // Compouent -------------------------------------------------

  const Footer = () => {
    return (
      !isApproved && (
        <>
          {showFooter && (
            <div
              className="main-footer pos-fixed l-0 b-0 "
              style={{ zIndex: 999, width: '100%' }}
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
                {}
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
          {isLoadingCreateOrder || isLoadingUpdateOrder ? t('bt_saving') : t('bt_save')}
        </Button>

        <Button
          startDecorator={<CreateNewFolder />}
          color="success"
          variant="soft"
          type="button"
          onClick={() => {
            handleSubmitMain(onSubmit)();
            saveType.current = 'savenew';
            //
            //routes.push('/sales-order/create');
          }}
          disabled={
            type === 'create' ? isLoadingCreateOrder : isLoadingUpdateOrder
          }
        >
          {isLoadingCreateOrder || isLoadingUpdateOrder ? 'Saving...' : 'New'}
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
          {isUpdateStatusRes || isUpdateStatusRes ? 'Approving...' : 'Approve'}
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
      <Footer />
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
          title: t('md_void_confirm_title'),
          body: (
            <span>
              {t('md_void_confirm_body_prefix')}{' '}
              <span className="tx-16 text-danger">{t('md_void_confirm_body_highlight')}</span>{' '}
              {t('md_void_confirm_body_suffix')}{' '}
              <span className="tx-16 text-danger">{t('md_void_confirm_body_revoke')}</span>
            </span>
          ),
          buttonName: t('md_void_confirm_button'),
        }}
      />
      <Seo title={'Product Form'} /> {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <div className="d-flex flex-row align-items-center">
            <span className="main-content-title mg-b-0 mg-b-lg-1">
              {t('title')}{' '}
              {orderSeqNo !== '' ? convertSalesOrderSeqNo(orderSeqNo) : ''}
            </span>
            {isApproved && !isVoid && (
              <>
                <span className="badge tx-16 badge-pill bg-indigo  mg-l-10 mg-r-20">
                  {t('approved')}
                </span>

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
                  {isUpdateStatusRes || isUpdateStatusRes ? t('bt_voiding') : t('bt_void')}
                </Button>
              </>
            )}
            {isVoid && (
              <span className="badge tx-16 badge-pill bg-danger  mg-l-10 mg-r-20">
                {t('void')}
              </span>
            )}
            <div className="mg-l-10 bd-s pd-l-10">
              <Button
                size="sm"
                startDecorator={<Print />}
                color="primary"
                variant="soft"
                onClick={() => {
                  const pdfDataParams = formatPdfData(salesOrder?.data);
                  //@ts-ignore
                  pdfDataParams.storeImageUrl = getStoreLogoUrl(storeInfo?.logo_url);
                  pdfOrder(pdfDataParams);
                }}
                disabled={type === 'create'}
              >
                {isLoadingOrderPdf ? t('bt_printing') : t('bt_print')}
              </Button>
            </div>
          </div>
        </div>
        <Row>{!isApproved && !showFooter && <SaveButtonGroup />}</Row>
        <div className="justify-content-center mt-2">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item
              className="breadcrumb-item tx-15"
              href="/sales-order/order-list"
            >
              {t('title')}
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
          <Col md={9}>
            <Card className="card custom-card">
              <Card.Header className="card-header">
                <Card.Body>
                  <Row className="row-xs">
                    <Col
                      md={3}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 999 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>
                          <a
                            onClick={() => {
                              setOpenVendorModal(true);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {t('lb_vendor')}{' '}
                            <span className=" text-success">{t('lb_new')}</span>
                          </a>
                        </Form.Label>
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
                              onChangeHandler={undefined}
                              //isDisabled={itemListDatas?.length > 0}
                            />
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col
                      md={3}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 891 }}
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
                            onChangeHandler={undefined}
                            //isDisabled={itemListDatas?.length > 0}
                          />
                        )}
                      </Form.Group>
                    </Col>
                    {/* <Col md={3}>
                      <Form.Group className="form-group">
                        <Form.Label>Sales #</Form.Label>
                        <Form.Control
                          {...register('sales_order_no')}
                          placeholder="Auto generate"
                          //defaultValue="12313123"
                          type="text"
                        />
                      </Form.Group>
                    </Col> */}
                    <Col md={3} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_invoice_no')}</Form.Label>
                        <Form.Control
                          {...register('invoice_no')}
                          placeholder={t('ph_invoice_no')}
                          type="text"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={3} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_batch_number')}</Form.Label>
                        <Form.Control
                          {...register('batch_number')}
                          placeholder={t('ph_batch_number')}
                          type="text"
                        />
                      </Form.Group>
                    </Col>

                    <Col
                      xs={12}
                      md={3}
                      xl={3}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 889 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_sales_date')}</Form.Label>
                        <InputGroup className="input-group reactdate-pic">
                          <InputGroup.Text className="input-group-text">
                            <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                          </InputGroup.Text>
                          <div className="wd-150">
                            <Datepicker
                              key="sales_order_date"
                              name="sales_order_date"
                              control={control}
                              isMulti={false}
                              rules={{
                                required: 'Sales order date is required',
                              }}
                            />
                          </div>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col
                      xs={12}
                      lg={3}
                      className=" mg-t-10 mg-md-t-0 "
                      style={{ zIndex: 888 }}
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
                          placeholder={t('ph_shipping_fee')}
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
                  <Row>
                    {/* 预留 Payment */}
                    {1 > 2 && (
                      <>
                        <Col xs={6} lg={3} className=" mg-t-10 mg-md-t-0">
                          <Form.Group className="form-group">
                            <Form.Label>Discount Amount</Form.Label>
                            <Form.Control
                              {...register('discount_amount', {
                                required: false,
                                validate: (value: any): any => {
                                  var pPattern =
                                    DECIMAL_GREATER_THAN_0_NULLABLE;

                                  if (!pPattern.test(value)) {
                                    return 'Value must be a number > 0';
                                  }
                                },
                              })}
                              placeholder="Discount Rate"
                              type="text"
                              style={{ textAlign: 'right' }}
                              onChange={(val) => {
                                //
                              }}
                              onFocus={(e) => {
                                // 在获得焦点时全选输入框中的内容
                                e.target.select();
                              }}
                            />
                            {errors.discount_amount && (
                              <Form.Text className="text-danger">
                                {errors.discount_amount.message as string}
                              </Form.Text>
                            )}
                          </Form.Group>
                        </Col>
                      </>
                    )}
                  </Row>
                </Card.Body>
              </Card.Header>
            </Card>
            <div ref={targetRef}></div>
            <Card className="card custom-card">
              <Card.Header className="card-header">
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
                              prepend({
                                qty_pur: '',
                                price_pur: 0,
                                tax_rate: 13,
                                remark: '',
                                item_id: value.id,
                                detail: { ...value },
                                sort_index: 0,
                              });
                            }}
                            // options={allItemsOptions}
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
                                  {item.detail && (
                                    <span>
                                      {`[${item.detail.sku}]`}
                                      {' - '}
                                      {item.detail.name_localizations.en}
                                      {' - '}
                                      {item.detail.sales_unit.name}
                                      {item.detail.inv_balance_real && (
                                        <>
                                          ; Inv-Balance:{' '}
                                          <span className="bg-indigo tx-white">
                                            {parseFloat(
                                              item.detail.inv_balance_real,
                                            ).toFixed(
                                              isNaN(qtyPrecision)
                                                ? 0
                                                : qtyPrecision,
                                            )}
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
                              <Col xs={6} md={3} className=" pd-b-6 ">
                                <Form.Label htmlFor={`item-${index}`}>
                                  {t('itemlb_qty')}{t('itemlb_qty_hint')}
                                </Form.Label>
                                <Form.Control
                                  {...register(`items.${index}.qty_sales`, {
                                    required: true,
                                    validate: (value: any): any => {
                                      var pPattern = NUMERIC_GREATER_OR_LESS_0;

                                      if (!pPattern.test(value)) {
                                        return 'Must be a number and <> 0';
                                      }
                                    },
                                  })}
                                  defaultValue={item.qty_sales}
                                  style={{ textAlign: 'right' }}
                                  placeholder=""
                                  type="text"
                                  onChange={(e) => {
                                    const newVal = e.target.value;
                                    // 直接通过setValue更新当前更改的input的值
                                    setValue(
                                      `items[${index}].qty_sales`,
                                      newVal,
                                    );
                                    calculateByField();
                                  }}
                                />
                                {errors &&
                                Object.keys(errors?.items || {}).length > 0 ? (
                                  <>
                                    <Form.Text className="text-danger">
                                      {errors.items &&
                                        // @ts-ignore
                                        errors.items[index]?.qty_sales?.message}
                                    </Form.Text>
                                  </>
                                ) : (
                                  <></>
                                )}
                              </Col>
                              <Col xs={6} md={3} className="  ">
                                <Form.Label htmlFor={`item-${index}`}>
                                  {t('itemlb_price')}{' '}
                                </Form.Label>
                                <Form.Control
                                  {...register(`items.${index}.price_sales`, {
                                    required: true,
                                    validate: (value: any): any => {
                                      var pPattern = DECIMAL_GREATER_THAN_0;

                                      if (!pPattern.test(value)) {
                                        return 'Must be a number and > 0';
                                      }
                                    },
                                  })}
                                  defaultValue={item.price_sales}
                                  style={{ textAlign: 'right' }}
                                  placeholder=""
                                  type="text"
                                  onChange={(e) => {
                                    const newVal = e.target.value;
                                    // 直接通过setValue更新当前更改的input的值
                                    setValue(
                                      `items[${index}].price_sales`,
                                      newVal,
                                    );
                                    calculateByField();
                                  }}
                                />
                                {errors &&
                                Object.keys(errors?.items || {}).length > 0 ? (
                                  <>
                                    <Form.Text className="text-danger">
                                      {errors.items &&
                                        // @ts-ignore
                                        errors.items[index]?.price_sales
                                          ?.message}
                                    </Form.Text>
                                  </>
                                ) : (
                                  <></>
                                )}
                              </Col>
                              <Col xs={6} md={3} className="  ">
                                <Form.Label htmlFor={`item-${index}`}>
                                  {t('itemlb_tax_rate')}{' '}
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
                                    setValue(
                                      `items[${index}].tax_rate`,
                                      newVal,
                                    );
                                    calculateByField();
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
                              <Col xs={6} md={3} className="  ">
                                <Form.Label htmlFor={`item-${index}`}>
                                  {t('itemlb_remarks')}{' '}
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
              </Card.Header>
            </Card>
          </Col>
          <Col md={3}>
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
                        {orderTotal.subtotal.toFixed(2)}
                      </Col>
                    </Row>
                    {orderTotal.promotion_amount > 0 && (
                      <Row>
                        <Col
                          md={6}
                          className="align-self-end"
                          style={{ textAlign: 'right' }}
                        >
                          Promo:
                        </Col>
                        <Col
                          md={6}
                          style={{ textAlign: 'right', fontSize: 14 }}
                        >
                          -{orderTotal.promotion_amount.toFixed(2)}
                        </Col>
                      </Row>
                    )}

                    <Row>
                      <Col
                        md={6}
                        className="align-self-end"
                        style={{ textAlign: 'right' }}
                      >
                        {t('lb_tax')}:
                      </Col>
                      <Col md={6} style={{ textAlign: 'right', fontSize: 14 }}>
                        {orderTotal.tax.toFixed(2)}
                      </Col>
                    </Row>
                    <Row>
                      <Col
                        md={6}
                        className="align-self-end text-danger"
                        style={{ textAlign: 'right' }}
                      >
                        Return:
                      </Col>
                      <Col md={6} style={{ textAlign: 'right', fontSize: 14 }}>
                        <span className="text-danger">
                          {orderTotal.return_amount &&
                            orderTotal.return_amount.toFixed(2)}
                        </span>
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
                        {orderTotal.total.toFixed(2)}
                      </Col>
                    </Row>
                  </Stack>
                </Card.Body>
              </Card.Header>
            </Card>
            {1 > 2 && (
              <Card className="card custom-card">
                <Card.Header className="card-header">
                  <Card.Title>{t('lb_payment')}</Card.Title>
                  <Card.Body>
                    <Stack direction="vertical" gap={3}>
                      <div>
                        <Form.Label>{t('lb_payment_method')}</Form.Label>
                        {paymentMethodOptions && (
                          <SelectPro
                            key="payment_method"
                            name="payment_method"
                            control={control}
                            defaultValue={undefined}
                            options={paymentMethodOptions}
                            isMulti={false}
                            rules={{}}
                            filterOption={undefined}
                            isDisabled={false}
                            onChangeHandler={undefined}
                          />
                        )}
                      </div>
                      <div>
                        <Form.Label>{t('lb_payment_status')}</Form.Label>
                        {paymentStatusOptions && (
                          <SelectPro
                            key="payment_status"
                            name="payment_status"
                            control={control}
                            defaultValue={undefined}
                            options={paymentStatusOptions}
                            isMulti={false}
                            rules={{}}
                            filterOption={undefined}
                            isDisabled={false}
                            onChangeHandler={undefined}
                          />
                        )}
                      </div>
                      <textarea
                        {...register('payment_remark')}
                        className="form-control "
                        placeholder="Remarks"
                        rows={2}
                      />
                    </Stack>
                  </Card.Body>
                </Card.Header>
              </Card>
            )}

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
    </div>
  );
};

//
const SalesOrderForm = () => {
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
  const { data: salesOrder, refetch } = useGetSalesOrderById({
    id: id,
  });

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
    if (!salesOrder) return;
    if (!(salesOrder as { data: any }).data) {
      routes.push('/sales-order/create');
    }
  }, [salesOrder]);
  return (
    <>
      {isMe && (
        <>
          {type === 'create' && (
            <Main type={type} salesOrder={salesOrder} id={id} />
          )}

          {type === 'edit' &&
          salesOrder &&
          (salesOrder as { data: any }).data ? (
            <Main
              type={type}
              salesOrder={salesOrder}
              id={id}
              refetchOrder={refetch}
            />
          ) : (
            ''
          )}
        </>
      )}
    </>
  );
};

SalesOrderForm.layout = 'Contentlayout';

export default SalesOrderForm;
