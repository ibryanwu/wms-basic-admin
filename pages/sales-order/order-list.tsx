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
import { useGetAllPaymentMethod, useGetAllPaymentStatus } from '@/rest/payment';
import { useGetAllVendors } from '@/rest/vendor';
import { useMe } from '@/rest/auth';
import { useForm } from 'react-hook-form';
import { useDeleteSalesOrder, useSearchSalesOrderList } from '@/rest/sales';
import { ISearchOrderParams } from '@/types/sales';
import { deleteSalesOrderIdAtom, useClearAllAtom } from '@/stores/atom';
import { useAtom } from 'jotai';
import { toast } from 'react-toastify';
import { useGetWarehouse } from '@/rest/inv';
import SalesOrderListDataTable from '@/component-lib/data-table/SalesOrderListDT';
import { convertSalesOrderSeqNo } from '@/service/sales';
import { getStaticTranslations } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';

export async function getStaticProps({ locale }: { locale: string }) {
  return getStaticTranslations(locale, ['common', 'sales_order_list', 'menu']);
}

const Main = () => {
  // Values  -------------------------------------------------
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [deleteOrderId, setDeleteOrderId] = useAtom(deleteSalesOrderIdAtom);

  // UseState  -----------------------------------------------
  // UseForm  ------------------------------------------------
  const {
    register,
    handleSubmit: handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    control,
  } = useForm({
    mode: 'onTouched',
    reValidateMode: 'onSubmit',
    //values: defaultFormDate,
  });
  // Hooks  --------------------------------------------------
  const { t } = useTranslation('sales_order_list');
  const { t: t0 } = useTranslation('common');
  const { mutate: getMe, data: me, isLoading: isLoadingMe, isMe } = useMe();
  const clearAllAtom = useClearAllAtom();
  const { data: warehouseData } = useGetWarehouse({ isActive: true });
  const { data: vendorsData } = useGetAllVendors({ type: 2 });
  const {
    mutate: searchMutate,
    data: orderListData,
    isLoading,
    serverError,
    setServerError,
  } = useSearchSalesOrderList();
  const {
    mutate: deleteOrderById,
    data: deleteRes,
    isLoading: isDeleteLoading,
  } = useDeleteSalesOrder();

  // Use Effect  ---------------------------------------------

  useEffect(() => {
    clearAllAtom();
    searchMutate({ params: { page: 1, pageSize: 100 }, payload: {} });
  }, []);

  useEffect(() => {
    if (deleteOrderId !== '') {
      deleteOrderById({ orderId: deleteOrderId });
      setDeleteOrderId('');
    }
  }, [deleteOrderId]);

  useEffect(() => {
    if (!deleteRes) return;
    if (deleteRes?.code === 0 && deleteRes.data.affected > 0) {
      //@ts-ignore
      handleSubmit(onSubmit)();
      toast.success(t('toast_delete_success'));
    } else {
      toast.error(t('toast_delete_failed'));
    }
  }, [deleteRes]);

  // Function ------------------------------------------------

  function onSubmit(data: ISearchOrderParams | any) {
    console.log('🚀 ~ file: order-list.tsx:62 ~ Main ~ data:', data);
    const payload: any = {
      seq_order_no: data.seq_order_no,
      batch_number: data.batch_number || '',
      highlight: data.highlight || '',
      invoice_no: data.invoice_no || '',
      start_date: data.start_date
        ? dayjs(data.start_date).format('YYYY-MM-DD')
        : '',
      end_date: data.end_date ? dayjs(data.end_date).format('YYYY-MM-DD') : '',
      remark: data.remark || '',
      vendor_id: data.vendor ? data.vendor.value : '',
      warehouse_id: data.warehouse ? data.warehouse.value : '',
    };
    console.log('🚀 ~ file: order-list.tsx:91 ~ onSubmit ~ payload:', payload);
    searchMutate({ params: { page: 1, pageSize: 200 }, payload });
  }

  const exportToCSV = () => {
    const poListHeader =
      'Sales Order Number / 单号,Customer / 客户,Number of items,Sales Date / 日期,SubTotal	,Tax,Shipping Fee,Total';

    if (orderListData) {
      const csv = `${poListHeader}\n${orderListData.data
        .map((row: any) => {
          console.log('🚀 ~ .map ~ row:', row);

          const field: any[] = [];
          field.push(convertSalesOrderSeqNo(row.seq_order_no));
          field.push(row.vendor.name);
          field.push(row.salesOrderItems.length);
          field.push(row.sales_order_date);
          field.push(row.total.subtotal);
          field.push(row.total.tax);
          field.push(row.total.shipping_fee);
          field.push(row.total.total);
          return field;
        })
        .join('\n')}`;

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
                            rules={{ required: 'Customer is required' }}
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
                      style={{ zIndex: 9 }}
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
                        <Form.Label>{t('lb_order_no')}</Form.Label>
                        <Form.Control
                          {...register('seq_order_no')}
                          placeholder={t('ph_order_no')}
                          type="text"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_invoice_no')}</Form.Label>
                        <Form.Control
                          {...register('invoice_no')}
                          placeholder={t('ph_invoice_no')}
                          type="text"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={2} className=" mg-t-10 mg-md-t-0">
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
                      lg={2}
                      xl={2}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 99 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_sales_start_date')}</Form.Label>
                        <InputGroup className="input-group reactdate-pic">
                          <InputGroup.Text className="input-group-text">
                            <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                          </InputGroup.Text>
                          <div className="wd-150">
                            <Datepicker
                              key="start_date"
                              name="start_date"
                              control={control}
                              isMulti={false}
                              rules={{ required: 'Purchased Date is required' }}
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
                              key="end_date"
                              name="end_date"
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
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_highlight')}</Form.Label>
                        <Form.Control
                          {...register('highlight')}
                          placeholder=""
                          type="text"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={1} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>
                          <span className="tx-white">.</span>
                        </Form.Label>
                        <Button type="submit" disabled={isLoading}>
                          {t0('btn_search')}
                        </Button>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card.Header>
            </Card>
          </Col>
        </Row>
      </Form>
      <div>
        <Row className="row-sm">
          {/* <!-- col --> */}
          <Col xl={12} md={12}>
            <Row className=" row-sm">
              {/* <!-- /col --> */}
              <Col lg={12}>
                <Stack direction="horizontal" gap={3} className="mg-b-10">
                  <Button
                    variant="primary"
                    onClick={() => {
                      exportToCSV();
                    }}
                  >
                    <i className="fa fa-table mg-r-4"></i>
                    {t0('btn_export')}
                  </Button>
                </Stack>
              </Col>
            </Row>
          </Col>
          {/* <!-- /col --> */}
        </Row>
        <SalesOrderListDataTable orderListData={orderListData} />
      </div>
    </div>
  );
};
const SalesOrderList = () => {
  return (
    <>
      <Main />
    </>
  );
};

SalesOrderList.layout = 'Contentlayout';

// SalesOrderList.layout = 'Contentlayout';

export default SalesOrderList;
