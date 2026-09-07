'use client';
// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import { MutationCache } from 'react-query';

import {
  Save,
  PlaylistAddCheck,
  CreateNewFolder,
  CloudSync,
} from '@mui/icons-material';
import Seo from '@/shared/layout-components/seo/seo';

import SelectPro from '../../../component-lib/select';
import {
  Breadcrumb,
  Col,
  Row,
  Form,
  Card,
  Stack,
  InputGroup,
  Dropdown,
} from 'react-bootstrap';

import { useToken } from '@/lib/hooks/use-token';
import { useRouter } from 'next/router';
import Datepicker from '../../../component-lib/form-ele';
import dayjs from 'dayjs';
import {
  useCalculateSalesOrder,
  useCreateSalesOrder,
  useGetSalesOrderById,
  useUpdateSalesOrder,
  useUpdateSalesOrderStatus,
} from '@/rest/sales';
import { DECIMAL_GREATER_THAN_0_NULLABLE } from '@/lib/constants';
import { useAtom } from 'jotai';
import { itemListForSalesAtom, useClearAllAtom } from '@/stores/atom';
import { set, useForm } from 'react-hook-form';
import {
  defaultOrderHeaderData,
  formatSalesOrderDetailDataForEdit,
  formatSalesOrderHeaderDataForEdit,
} from '@/service/sales';
import { Button, ButtonGroup } from '@mui/joy';
import EditSalesOrderItemsDrawer from '../../../component-lib/modal/edit-sales-item-drawer';
import { useGetAllVendors } from '@/rest/vendor';
import { useGetAllPaymentMethod, useGetAllPaymentStatus } from '@/rest/payment';
import { useGetAllItems } from '@/rest/items';
import { useMe } from '@/rest/auth';
import { toast } from 'react-toastify';
import { ItotalAmount } from '@/types/sales';
import { useGetWarehouse } from '@/rest/inv';
import ItemListDataTableForSales from '@/component-lib/data-table/itemListDTForSales';
import { ConfirmModal } from '@/component-lib/modal/confirm-modal';
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
  const { salesOrder, type, id } = props;
  const defaultTotal = {
    subtotal: 0,
    total: 0,
    tax: 0,
    discount_rate: 0,
    discount_amount: 0,
    promotion_amount: 0,
  };

  // Atoms ----------------------------------------------------
  const [itemListDatas, setItemListDatas] = useAtom(itemListForSalesAtom);

  // UseState  ----------------------------------------------------
  const [defaultFormDate, setDefaultFormDate] = useState<any>();
  const [orderTotal, setOrderTotal] = useState<any>(defaultTotal);
  const [confirmModalShow, setConfirmModalShow] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [orderSeqNo, setOrderSeqNo] = useState('');
  const [allItemsOptions, setallItemsOptions] = useState([]);

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
  // Hooks  ---------------------------------------------------------
  const { t } = useTranslation('sales_order');
  const routes = useRouter();
  const clearAllAtom = useClearAllAtom();
  const { mutate: getMe, data: me, isLoading: isLoadingMe, isMe } = useMe();
  const { options: paymentMethodOptions } = useGetAllPaymentMethod();
  const { options: paymentStatusOptions } = useGetAllPaymentStatus();
  const { data: vendorsData } = useGetAllVendors({ type: 2, isActive: true });
  const { data: warehouseData } = useGetWarehouse({ isActive: true });

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

  // Use Effect  ----------------------------------------------------
  useEffect(() => {
    clearAllData();
    routes.replace(routes.asPath); //为了避免页面切换时的缓存，要强制刷新一次页面
  }, []);

  useEffect(() => {
    if (type !== 'create') return;
    const defaultWarehouse = warehouseData?.data.filter((item: any) => {
      return item.isDefault === true;
    });

    if (defaultWarehouse?.length > 0 && defaultFormDate) {
      defaultFormDate.warehouse = defaultWarehouse[0];
      reset(defaultFormDate);
    }
  }, [warehouseData]);

  useEffect(() => {
    if (type !== 'create') return;

    const defaultVendor = vendorsData?.data.filter((item: any) => {
      return item.isDefault === true;
    });

    if (defaultVendor?.length > 0 && defaultFormDate) {
      defaultFormDate.vendor = defaultVendor[0];
      reset(defaultFormDate);
    }
  }, [vendorsData]);

  // [***Update***] 模式下格式化加载销货单内容
  useEffect(() => {
    if (salesOrder?.data !== null && salesOrder?.data !== undefined) {
      const { data } = salesOrder;

      setOrderSeqNo(data.seq_order_no);
      setIsApproved(data.is_approved);

      const salesItems = formatSalesOrderDetailDataForEdit(
        salesOrder.data.salesOrderItems,
      );

      const orderHeader = formatSalesOrderHeaderDataForEdit(data);
      const total: ItotalAmount = orderHeader.total as unknown as ItotalAmount;

      setDefaultFormDate(orderHeader);
      setItemListDatas([...salesItems]);
      setOrderTotal({ ...total });
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
      routes.push(`/sales-order/${createdOrderRes.data}`);
      toast.success(t('toast_created_success'));
    } else {
      toast.error(createdOrderRes?.msg);
    }
  }, [createdOrderRes]);

  useEffect(() => {
    if (updateOrderRes?.code === 0) {
      routes.push(`/sales-order/${updateOrderRes.data}`);
      toast.success(t('toast_update_success'));
    } else {
      toast.error(createdOrderRes?.msg);
    }
  }, [updateOrderRes]);

  useEffect(() => {
    if (updateStatusRes?.code === 0) {
      if (updateStatusRes.data) {
        toast.success(t('toast_status_success'));
        setIsApproved(true);
      }
    }
  }, [updateStatusRes]);

  // Function ------------------------------------------------

  const setApproved = () => {
    updateStatus({ id: id, isApproved: true });
  };
  const clearAllData = () => {
    setDefaultFormDate(defaultOrderHeaderData);
    setItemListDatas([]);
  };

  const calculate = () => {
    if (itemListDatas.length > 0) {
      let discount_rate = getValues('discount_rate');
      if (discount_rate === '') discount_rate = '0';
      calculateOrder({ discount_rate, discount_amount: '0', itemListDatas });
    }
  };

  const onSubmit = (data: any) => {
    //
    if (itemListDatas.length > 0) {
      //
      const header = {
        ...data,
        vendor_id: data.vendor.value,
        warehouse_id: data.warehouse.value,
        payment_method_id: data.payment_method?.value || '',
        payment_status_id: data.payment_status?.value || '',
        shipping_fee: data.shipping_fee || 0,
      };
      const allData = { header: header, items: itemListDatas };

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

  return (
    <div>
      <ConfirmModal
        show={confirmModalShow}
        setShow={setConfirmModalShow}
        fun={() => {
          setApproved();
          setConfirmModalShow(false);
        }}
        info={{
          title: t('md_approve_confirm_title'),
          body: t('md_approve_confirm_body_drawer'),
          buttonName: t('md_approve_confirm_button'),
        }}
      />
      <Seo title={'Product Form'} /> {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            {t('title')}{' '}
            {orderSeqNo !== '' ? `S${String(orderSeqNo).padStart(5, '0')}` : ''}
            {isApproved && (
              <span className="badge badge-pill bg-secondary me-1">
                {t('approved')}
              </span>
            )}
          </span>
          {isLoadingCalculate ? <span>{t('bt_calculating')}</span> : null}
        </div>
        <Row>
          {!isApproved && (
            <ButtonGroup>
              <Button
                startDecorator={<Save />}
                color="primary"
                variant="soft"
                type="submit"
                onClick={handleSubmitMain(onSubmit)}
                disabled={
                  type === 'create'
                    ? isLoadingCreateOrder
                    : isLoadingUpdateOrder
                }
              >
                {isLoadingCreateOrder || isLoadingUpdateOrder
                  ? t('bt_saving')
                  : t('bt_save')}
              </Button>

              <Button
                startDecorator={<CreateNewFolder />}
                color="success"
                variant="soft"
                type="button"
                onClick={() => {
                  handleSubmitMain(onSubmit)();
                  clearAllAtom();
                  clearAllData();
                  routes.push('/sales-order/create');
                }}
                disabled={
                  type === 'create'
                    ? isLoadingCreateOrder
                    : isLoadingUpdateOrder
                }
              >
                {isLoadingCreateOrder || isLoadingUpdateOrder
                  ? t('bt_saving')
                  : t('bt_save_create_new')}
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
                {isUpdateStatusRes || isUpdateStatusRes
                  ? t('bt_approving')
                  : t('bt_approve')}
              </Button>
            </ButtonGroup>
          )}
        </Row>
        <div className="justify-content-center mt-2">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item
              className="breadcrumb-item tx-15"
              href="./index.tsx"
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
                        <Form.Label>{t('lb_vendor')}</Form.Label>
                        {vendorsData?.data && (
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
                        )}
                      </Form.Group>
                    </Col>
                    <Col
                      md={3}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 999 }}
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
                    <Col xs={6} lg={3} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_shipping_fee')}</Form.Label>
                        <Form.Control
                          {...register('shipping_fee', {
                            required: false,
                            validate: (value: any): any => {
                              var pPattern = DECIMAL_GREATER_THAN_0_NULLABLE;

                              if (!pPattern.test(value)) {
                                return 'Value must be a number > 0';
                              }
                            },
                          })}
                          placeholder={t('ph_shipping_fee')}
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
                        {errors.shipping_fee && (
                          <Form.Text className="text-danger">
                            {errors.shipping_fee.message as string}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                    <Col
                      xs={12}
                      md={3}
                      xl={4}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 888 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_sales_date')}</Form.Label>
                        <InputGroup className="input-group reactdate-pic">
                          <InputGroup.Text className="input-group-text">
                            <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                          </InputGroup.Text>
                          <Datepicker
                            key="sales_order_date"
                            name="sales_order_date"
                            control={control}
                            isMulti={false}
                            rules={{ required: 'Sales order date is required' }}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col
                      xs={12}
                      lg={4}
                      className=" mg-t-10 mg-md-t-0 "
                      style={{ zIndex: 888 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_received_date')}</Form.Label>
                        <InputGroup className="input-group reactdate-pic">
                          <InputGroup.Text className="input-group-text">
                            <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                          </InputGroup.Text>
                          <Datepicker
                            key="received_date"
                            name="received_date"
                            control={control}
                            isMulti={false}
                            rules={{}}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    {/* 预留 Payment */}
                    {1 > 2 && (
                      <>
                        <Col xs={6} lg={3} className=" mg-t-10 mg-md-t-0">
                          <Form.Group className="form-group">
                            <Form.Label>{t('lb_discount_amount')}</Form.Label>
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
                              placeholder={t('ph_discount_rate')}
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

            <Card className="card custom-card">
              <Card.Header className="card-header">
                <Card.Body>
                  <Stack gap={2}>
                    <EditSalesOrderItemsDrawer
                      allItemsOptions={allItemsOptions}
                      calculate={calculate}
                    />

                    <ItemListDataTableForSales calculate={calculate} />
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
                          {t('lb_promo')}
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
                        {t('lb_return')}
                      </Col>
                      <Col md={6} style={{ textAlign: 'right', fontSize: 14 }}>
                        <span className="text-danger">
                          {orderTotal.return_amount &&
                            orderTotal.return_amount.toFixed(2)}
                        </span>
                      </Col>
                    </Row>
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
                        placeholder={t('ph_remarks')}
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
            <Main type={type} salesOrder={salesOrder} id={id} />
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
