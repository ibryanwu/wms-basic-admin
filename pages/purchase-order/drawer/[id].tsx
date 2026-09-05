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
  useCalculatePruchaseOrder,
  useCreatePruchaseOrder,
  useGetPurchaseOrderById,
  useUpdatePruchaseOrder,
  useUpdatePurOrderStatus,
} from '@/rest/purchase';
import { DECIMAL_GREATER_THAN_0_NULLABLE } from '@/lib/constants';
import { useAtom } from 'jotai';
import { itemListAtom, useClearAllAtom } from '@/stores/atom';
import { set, useForm } from 'react-hook-form';
import {
  defaultOrderHeaderData,
  formatPurOrderDetailDataForEdit,
  formatPurOrderHeaderDataForEdit,
} from '@/service/purchase';
import { Button, ButtonGroup } from '@mui/joy';
import EditPurchaseOrderItemsDrawer from '../../../component-lib/modal/edit-pur-item-drawer';
import { useGetAllVendors } from '@/rest/vendor';
import { useGetAllPaymentMethod, useGetAllPaymentStatus } from '@/rest/payment';
import { useGetAllItems } from '@/rest/items';
import ItemListDataTable from '../../../component-lib/data-table/itemListDT';
import { useMe } from '@/rest/auth';
import { toast } from 'react-toastify';
import { ItotalAmount } from '@/types/purchase';
import { useGetWarehouse } from '@/rest/inv';
import { ConfirmModal } from '@/component-lib/modal/confirm-modal';

const Main = (props: any) => {
  // Values  ----------------------------------------------------
  const { purchaseOrder, type, id } = props;
  const defaultTotal = {
    subtotal: 0,
    total: 0,
    tax: 0,
    discount_rate: 0,
    discount_amount: 0,
    promotion_amount: 0,
  };

  // Atoms ----------------------------------------------------
  const [itemListDatas, setItemListDatas] = useAtom(itemListAtom);

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
    setValue,
    reset,
    control,
  } = useForm({
    mode: 'onTouched',
    reValidateMode: 'onSubmit',
    values: defaultFormDate,
  });
  // Hooks  ---------------------------------------------------------
  const routes = useRouter();
  const clearAllAtom = useClearAllAtom();
  const { mutate: getMe, data: me, isLoading: isLoadingMe, isMe } = useMe();
  const { options: paymentMethodOptions } = useGetAllPaymentMethod();
  const { options: paymentStatusOptions } = useGetAllPaymentStatus();
  const { data: vendorsData } = useGetAllVendors({ type: 1, isActive: true });
  const { data: warehouseData } = useGetWarehouse({ isActive: true });

  const {
    mutate: calculateOrder,
    data: calculatedData,
    isLoading: isLoadingCalculate,
  } = useCalculatePruchaseOrder();
  const {
    mutate: createOrder,
    data: createdOrderRes,
    isLoading: isLoadingCreateOrder,
  } = useCreatePruchaseOrder();
  const {
    mutate: updateOrder,
    data: updateOrderRes,
    isLoading: isLoadingUpdateOrder,
  } = useUpdatePruchaseOrder();
  const {
    mutate: updateStatus,
    data: updateStatusRes,
    isLoading: isUpdateStatusRes,
  } = useUpdatePurOrderStatus();
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

  // [***Update***] 模式下格式化加载进货单内容
  useEffect(() => {
    if (purchaseOrder?.data !== null && purchaseOrder?.data !== undefined) {
      const { data } = purchaseOrder;
      console.log('setOrderSeqNo', data);
      setOrderSeqNo(data.seq_order_no);
      setIsApproved(data.is_approved);

      const purchaseItems = formatPurOrderDetailDataForEdit(
        purchaseOrder.data.purchaseItems,
      );

      const orderHeader = formatPurOrderHeaderDataForEdit(data);
      const total: ItotalAmount = orderHeader.total as unknown as ItotalAmount;

      setDefaultFormDate(orderHeader);
      setItemListDatas([...purchaseItems]);
      setOrderTotal({ ...total });
    } else {
      let today = dayjs().toDate();
      setDefaultFormDate({ ...defaultFormDate, purchased_date: today });
    }
  }, [purchaseOrder]);

  useEffect(() => {
    getMe();
    console.log(
      '🚀 ~ file: [id].tsx:139 ~ Main ~ calculatedData:',
      calculatedData?.data,
    );
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
      routes.push(`/purchase-order/${createdOrderRes.data}`);
      toast.success('Order created successfully');
    } else {
      toast.error(createdOrderRes?.msg);
    }
  }, [createdOrderRes]);

  useEffect(() => {
    if (updateOrderRes?.code === 0) {
      routes.push(`/purchase-order/${updateOrderRes.data}`);
      toast.success('Order update successfully');
    } else {
      toast.error(createdOrderRes?.msg);
    }
  }, [updateOrderRes]);

  useEffect(() => {
    console.log('updateStatusRes', updateStatusRes);
    if (updateStatusRes?.code === 0) {
      if (updateStatusRes.data) {
        toast.success('Update order status successfully');
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
    console.log('🚀 ~ onSubmit ~ data:', data);
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

      console.log('🚀 ~ onSubmit ~ allData:', allData);
      if (type === 'create') {
        // @ts-ignore
        createOrder(allData);
      }
      if (type === 'edit') {
        // @ts-ignore
        updateOrder(allData);
      }
    } else {
      toast.error('Please add at least one item');
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
          title: 'Confirm Approve Order',
          body: 'Please double-check this order. After approval, the inventory will be changed and cannot be revoked!',
          buttonName: 'Approve',
        }}
      />
      <Seo title={'Product Form'} /> {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Purchase Order{' '}
            {orderSeqNo !== '' ? `P${String(orderSeqNo).padStart(5, '0')}` : ''}
            {isApproved && (
              <span className="badge badge-pill bg-secondary me-1">
                Approved
              </span>
            )}
          </span>
          {isLoadingCalculate ? <span>Calculating ...</span> : null}
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
                  ? 'Saving...'
                  : 'Save'}
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
                  routes.push('/purchase-order/create');
                }}
                disabled={
                  type === 'create'
                    ? isLoadingCreateOrder
                    : isLoadingUpdateOrder
                }
              >
                {isLoadingCreateOrder || isLoadingUpdateOrder
                  ? 'Saving...'
                  : 'Save & Create New'}
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
                  ? 'Approving...'
                  : 'Approve'}
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
              Purchase Order
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
                        <Form.Label>Vendor</Form.Label>
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
                        <Form.Label>Warehouse</Form.Label>
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
                        <Form.Label>Purchase #</Form.Label>
                        <Form.Control
                          {...register('pur_order_no')}
                          placeholder="Auto generate"
                          //defaultValue="12313123"
                          type="text"
                        />
                      </Form.Group>
                    </Col> */}
                    <Col md={3} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>Invoice No</Form.Label>
                        <Form.Control
                          {...register('invoice_no')}
                          placeholder="Resource"
                          type="text"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={3} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>Batch Number</Form.Label>
                        <Form.Control
                          {...register('batch_number')}
                          placeholder="批次号"
                          type="text"
                        />
                      </Form.Group>
                    </Col>
                    <Col
                      xs={12}
                      lg={6}
                      xl={4}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 888 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>Purchased Date</Form.Label>
                        <InputGroup className="input-group reactdate-pic">
                          <InputGroup.Text className="input-group-text">
                            <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                          </InputGroup.Text>
                          <Datepicker
                            key="purchased_date"
                            name="purchased_date"
                            control={control}
                            isMulti={false}
                            rules={{ required: 'Purchased Date is required' }}
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
                        <Form.Label>Received Date</Form.Label>
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
                    <Col xs={6} lg={3} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>Shipping Fee</Form.Label>
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
                          placeholder="Shipping Fee"
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

            <Card className="card custom-card">
              <Card.Header className="card-header">
                <Card.Body>
                  <Stack gap={2}>
                    <EditPurchaseOrderItemsDrawer
                      allItemsOptions={allItemsOptions}
                      calculate={calculate}
                    />

                    <ItemListDataTable calculate={calculate} />
                  </Stack>
                </Card.Body>
              </Card.Header>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="card custom-card">
              <Card.Header className="card-header">
                <Card.Title>Amount</Card.Title>
                <Card.Body>
                  <Stack direction="vertical" gap={1}>
                    <Row>
                      <Col
                        md={6}
                        className="align-self-end"
                        style={{ textAlign: 'right' }}
                      >
                        Subtotal:
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
                        Tax:
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
                    <Row className="bd-y">
                      <Col
                        md={6}
                        className="align-self-center "
                        style={{ textAlign: 'right' }}
                      >
                        Total:
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
                  <Card.Title>Payment</Card.Title>
                  <Card.Body>
                    <Stack direction="vertical" gap={3}>
                      <div>
                        <Form.Label>Payment Method</Form.Label>
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
                        <Form.Label>Payment Statue</Form.Label>
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
                <Card.Title>Remarks</Card.Title>
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
          </Col>
        </Row>
      </Form>
    </div>
  );
};

//
const PurchaseOrderForm = () => {
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
  const { data: purchaseOrder, refetch } = useGetPurchaseOrderById({
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
    if (!purchaseOrder) return;
    if (!(purchaseOrder as { data: any }).data) {
      routes.push('/purchase-order/create');
    }
  }, [purchaseOrder]);
  return (
    <>
      {isMe && (
        <>
          {type === 'create' && (
            <Main type={type} purchaseOrder={purchaseOrder} id={id} />
          )}

          {type === 'edit' &&
          purchaseOrder &&
          (purchaseOrder as { data: any }).data ? (
            <Main type={type} purchaseOrder={purchaseOrder} id={id} />
          ) : (
            ''
          )}
        </>
      )}
    </>
  );
};

PurchaseOrderForm.layout = 'Contentlayout';

export default PurchaseOrderForm;
