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
import { ISearchOrderParams } from '@/types/outbound';
import { deleteOrderIdAtom, useClearAllAtom } from '@/stores/atom';
import { useAtom } from 'jotai';
import { toast } from 'react-toastify';
import { useGetWarehouse } from '@/rest/inv';
import { exportOutboundListToCSV, orderTypeOptions } from '@/service/outbound';
import OutboundOrderListDataTable from '@/component-lib/data-table/OutboundOrderListDt';
import { cleanObject } from '@/utils/public';
import {
  useDeleteTransferOrder,
  useSearchTransferOrderList,
} from '@/rest/transfer';
import { exportTransferOrderListToCSV } from '@/service/transfer';
import TransferOrderListDataTable from '@/component-lib/data-table/TransferOrderListDt';
import { useTranslation } from 'react-i18next';
import { getStaticTranslations } from '@/lib/i18n';
export async function getStaticProps({ locale }: { locale: string }) {
  return getStaticTranslations(locale, [
    'common',
    'transfer_order_list',
    'menu',
  ]);
}

const Main = () => {
  // Values  -------------------------------------------------
  const searchStartDay = dayjs().subtract(2, 'month').startOf('month').toDate();
  const searchEndDay = dayjs().add(1, 'day').toDate();
  const defaultSearchData = {
    startDate: searchStartDay,
    endDate: searchEndDay,
    fromWarehouse: {},
    toWarehouse: {},
    orderNo: '',
    remark: '',
    itemId: '',
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
  const { t } = useTranslation('transfer_order_list');
  const { t: t0 } = useTranslation('common');
  const clearAllAtom = useClearAllAtom();
  const { data: warehouseData } = useGetWarehouse({ isActive: true });
  const { data: vendorsData } = useGetAllVendors({ type: 2 });
  const {
    mutate: searchMutate,
    data: orderListData,
    isLoading,
    serverError,
    setServerError,
  } = useSearchTransferOrderList();

  const {
    mutate: deleteOrderById,
    data: deleteRes,
    isLoading: isDeleteLoading,
  } = useDeleteTransferOrder();

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
      orderNo: data.orderNo || '',
      startDate: data.startDate
        ? dayjs(data.startDate).format('YYYY-MM-DD')
        : '',
      endDate: data.endDate ? dayjs(data.endDate).format('YYYY-MM-DD') : '',
      remark: data.remark || '',
      fromWarehouseId: data.fromWarehouse
        ? data.fromWarehouse.value
        : undefined,
      toWarehouseId: data.toWarehouse ? data.toWarehouse.value : undefined,
    });

    searchMutate({ params: { page: 1, pageSize: 200 }, payload });
  }

  return (
    <div>
      <Seo title={'Product Form'} /> {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            {t('transfer_order')}
          </span>
        </div>

        <div className="justify-content-center mt-2">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item
              className="breadcrumb-item tx-15"
              href="./index.tsx"
            >
              {t('transfer_order')}
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
                      style={{ zIndex: 100 }}
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
                            filterOption={undefined}
                            isDisabled={false}
                            onChangeHandler={undefined}
                            //isDisabled={itemListDatas?.length > 0}
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
                        <Form.Label>{t('lb_to_warehouse')}</Form.Label>
                        {warehouseData?.data && (
                          <SelectPro
                            key="toWarehouse"
                            name="toWarehouse"
                            control={control}
                            defaultValue={undefined}
                            options={warehouseData.data}
                            isMulti={false}
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
                          {...register('orderNo')}
                          placeholder="单号"
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
                              rules={{
                                required: t('lb_order_start_date_required'),
                              }}
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
                        <Form.Label>{t('lb_remark')}</Form.Label>
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
                            {t0('btn_reset')}
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
                            {t0('btn_search')}
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
            {/* 隐藏导出按钮 */}
            {/* <Row className=" row-sm">
              <Col lg={12}>
                <Stack direction="horizontal" gap={3} className="mg-b-10">
                  <Button
                    variant="primary"
                    onClick={() => {
                      exportTransferOrderListToCSV(orderListData.data);
                    }}
                  >
                    <i className="fa fa-table mg-r-4"></i>
                    Export CSV
                  </Button>
                </Stack>
              </Col>
            </Row> */}
            <TransferOrderListDataTable orderListData={orderListData.data} />
          </>
        )}
      </div>
    </div>
  );
};
const TransferOrderList = () => {
  return (
    <>
      <Main />
    </>
  );
};

TransferOrderList.layout = 'Contentlayout';

// PurchaseOrderList.layout = 'Contentlayout';

export default TransferOrderList;
