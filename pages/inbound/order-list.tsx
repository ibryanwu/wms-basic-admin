'use client';
import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Seo from '@/shared/layout-components/seo/seo';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});
import SelectPro from '../../component-lib/select';

import { useToken } from '@/lib/hooks/use-token';
import { useRouter } from 'next/router';
import Datepicker from '../../component-lib/form-ele';
import { ButtonGroup } from '@mui/joy';
import {
  Breadcrumb,
  Button,
  Col,
  Row,
  Form,
  Card,
  Stack,
  InputGroup,
} from 'react-bootstrap';
import Link from 'next/link';
import dayjs from 'dayjs';
import { useGetAllVendors } from '@/rest/vendor';
import { useMe } from '@/rest/auth';
import { useForm } from 'react-hook-form';
import {
  useDeleteInboundOrder,
  useSearchInboundOrderList,
} from '@/rest/inbound';
import { ISearchOrderParams } from '@/types/inbound';
import { deleteOrderIdAtom, useClearAllAtom } from '@/stores/atom';
import { useAtom } from 'jotai';
import { toast } from 'react-toastify';
import { useGetWarehouse } from '@/rest/inv';
import { exportInboundListToCSV, orderTypeOptions } from '@/service/inbound';
import InboundOrderListDataTable from '@/component-lib/data-table/InboundOrderListDt';
import { cleanObject } from '@/utils/public';
import { getStaticTranslations } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';

export async function getStaticProps({ locale }: { locale: string }) {
  return getStaticTranslations(locale, ['common', 'inbound_order_list', 'menu']);
}

const Main = () => {
  // Values  -------------------------------------------------
  const searchStartDay = dayjs().subtract(2, 'month').startOf('month').toDate();
  const searchEndDay = dayjs().add(1, 'day').toDate();

  const defaultSearchData = {
    startDate: searchStartDay,
    endDate: searchEndDay,
    vendor: {},
    warehouse: {},
    batchNumber: '',
    orderNo: '',
    remark: '',
    invoiceNo: '',
  };
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [deleteOrderId, setDeleteOrderId] = useAtom(deleteOrderIdAtom);

  // UseState  -----------------------------------------------
  // UseForm  ------------------------------------------------
  const {
    register,
    handleSubmit: handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    control,
    reset,
  } = useForm({
    mode: 'onTouched',
    reValidateMode: 'onSubmit',
    defaultValues: defaultSearchData,
  });
  // Hooks  --------------------------------------------------
  const { t: t0 } = useTranslation('common'); // 加载 xxx.json 翻译文件
  const { t } = useTranslation('inbound_order_list'); // 加载 xxx.json 翻译文件
  const clearAllAtom = useClearAllAtom();
  const { data: warehouseData } = useGetWarehouse({ isActive: true });
  const { data: vendorsData } = useGetAllVendors({ type: 1 });
  const {
    mutate: searchMutate,
    data: orderListData,
    isLoading,
    serverError,
    setServerError,
  } = useSearchInboundOrderList();

  const {
    mutate: deleteOrderById,
    data: deleteRes,
    isLoading: isDeleteLoading,
  } = useDeleteInboundOrder();

  // Use Effect  ---------------------------------------------

  useEffect(() => {
    clearAllAtom();
    searchMutate({ params: { page: 1, pageSize: 100 }, payload: {} });
  }, []);

  useEffect(() => {
    if (deleteOrderId !== '') {
      deleteOrderById({ id: deleteOrderId });
      setDeleteOrderId('');
    }
  }, [deleteOrderId]);

  useEffect(() => {
    if (!deleteRes) return;
    if (deleteRes?.code === 0 && deleteRes.data.affected > 0) {
      //@ts-ignore
      handleSubmit(onSubmit)();
      toast.success('Order delete successfully');
    } else {
      toast.error('Delete order failed');
    }
  }, [deleteRes]);

  // Function ------------------------------------------------
  const resetSearch = () => {
    reset(defaultSearchData);
  };
  function onSubmit(data: ISearchOrderParams | any) {
    const payload: any = cleanObject({
      batchNumber: data.batchNumber || '',
      invoiceNo: data.invoiceNo || '',
      startDate: data.startDate
        ? dayjs(data.start_date).format('YYYY-MM-DD')
        : '',
      endDate: data.endDate ? dayjs(data.endDate).format('YYYY-MM-DD') : '',
      remark: data.remark || '',
      vendorId: data.vendor ? data.vendor.value : '',
      warehouseId: data.warehouse ? data.warehouse.value : '',
    });

    searchMutate({ params: { page: 1, pageSize: 400 }, payload });
  }

  return (
    <div>
      <Seo title={'Product Form'} /> {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            {t('title')}
          </span>
        </div>

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
              List
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      {/* <!-- /breadcrumb --> */}
      <Form className="form-horizontal" onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col md={12}>
            <Card className="card custom-card">
              <Card.Header className="card-header">
                <Card.Body>
                  <Row className="row-xs">
                    <Col
                      md={2}
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
                          />
                        )}
                      </Form.Group>
                    </Col>
                    <Col
                      md={2}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 100 }}
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

                    <Col md={2} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_invoice_no')}</Form.Label>
                        <Form.Control
                          {...register('invoiceNo')}
                          placeholder="来源单号"
                          type="text"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_batch_number')}</Form.Label>
                        <Form.Control
                          {...register('batchNumber')}
                          placeholder="批次号"
                          type="text"
                        />
                      </Form.Group>
                    </Col>
                    <Col
                      md={2}
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

                    <Col
                      xs={12}
                      lg={2}
                      xl={2}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 99 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_order_start_date')}</Form.Label>
                        <InputGroup className="input-group reactdate-pic">
                          <InputGroup.Text className="input-group-text">
                            <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                          </InputGroup.Text>
                          <div className="wd-150">
                            <Datepicker
                              key="startDate"
                              name="startDate"
                              control={control}
                              isMulti={false}
                              rules={{ required: 'Order Date is required' }}
                            />
                          </div>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col
                      xs={12}
                      lg={2}
                      className=" mg-t-10 mg-md-t-0 "
                      style={{ zIndex: 99 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_order_end_date')}</Form.Label>
                        <InputGroup className="input-group reactdate-pic">
                          <InputGroup.Text className="input-group-text">
                            <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                          </InputGroup.Text>
                          <div className="wd-150">
                            <Datepicker
                              key="endDate"
                              name="endDate"
                              control={control}
                              isMulti={false}
                              rules={{}}
                            />
                          </div>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={4} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_remarks')}</Form.Label>
                        <Form.Control
                          {...register('remark')}
                          placeholder=""
                          type="text"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={3} className=" mg-t-10 mg-md-t-0">
                      <Row>
                        <Form.Group className="form-group">
                          <Form.Label>
                            <span className="tx-white">.</span>
                          </Form.Label>
                          <Button
                            className="btn btn-warning"
                            disabled={isLoading}
                            onClick={() => {
                              resetSearch();
                            }}
                          >
                            {t0('reset')}
                          </Button>
                        </Form.Group>
                        <Form.Group className="form-group">
                          <Form.Label>
                            <span className="tx-white">.</span>
                          </Form.Label>
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isLoading}
                          >
                            {t0('search')}
                          </Button>
                        </Form.Group>
                      </Row>
                    </Col>
                  </Row>
                </Card.Body>
              </Card.Header>
            </Card>
          </Col>
        </Row>
      </Form>
      <div className="mg-b-40">
        {orderListData?.code === 0 && orderListData?.data?.data && (
          <>
            <Row className=" row-sm">
              {/* <!-- /col --> */}
              <Col lg={12}>
                <Stack direction="horizontal" gap={3} className="mg-b-10">
                  <Button
                    variant="primary"
                    onClick={() => {
                      exportInboundListToCSV(orderListData.data);
                    }}
                  >
                    <i className="fa fa-table mg-r-4"></i>
                    {t0('btn_export')}
                  </Button>
                </Stack>
              </Col>
            </Row>
            <div>
              <InboundOrderListDataTable orderListData={orderListData.data} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
const InboundOrderList = () => {
  return (
    <>
      <Main />
    </>
  );
};

InboundOrderList.layout = 'Contentlayout';

// PurchaseOrderList.layout = 'Contentlayout';

export default InboundOrderList;
