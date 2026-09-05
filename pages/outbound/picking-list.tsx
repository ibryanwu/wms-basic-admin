'use client';
import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Seo from '@/shared/layout-components/seo/seo';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});
import SelectPro from '../../component-lib/select';
import _ from 'lodash';
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
import dayjs from 'dayjs';
import { useGetAllVendors } from '@/rest/vendor';
import { useMe } from '@/rest/auth';
import { useForm } from 'react-hook-form';
import {
  useDeleteOutboundOrder,
  useGetBulkPickingListData,
  useGetPickingListData,
  useSearchOutboundOrderList,
} from '@/rest/outbound';
import { ISearchOrderParams } from '@/types/outbound';
import {
  deleteOrderIdAtom,
  openBulkPickingListDrawerAtom,
  openPickingListDrawerAtom,
  useClearAllAtom,
} from '@/stores/atom';
import { useAtom } from 'jotai';
import { toast } from 'react-toastify';
import { useGetWarehouse } from '@/rest/inv';
import { cleanObject } from '@/utils/public';
import OutboundPickingOrderListDataTable from '@/component-lib/data-table/picking/PickingOrderListDt';
import PickingListDrawer from '@/component-lib/modal/drawer/picking-list-drawer';
import BulkPickingListDrawer from '@/component-lib/modal/drawer/bulk-picking-list-drawer';

import { getStaticTranslations } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';

export async function getStaticProps({ locale }: { locale: string }) {
  return getStaticTranslations(locale, ['common', 'picking_list', 'menu']);
}
const Main = () => {
  // Values  -------------------------------------------------
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [_0, setOpenPickingListDrawer] = useAtom(openPickingListDrawerAtom);
  const [_1, setOpenBulkPickingListDrawer] = useAtom(
    openBulkPickingListDrawerAtom,
  );
  // UseState  -----------------------------------------------
  const [pickingOrderId, setPickingOrderId] = useState();
  const [bulkPickingOrderIds, setBulkPickingOrderIds] = useState<string[]>([]);
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
  const { t } = useTranslation('picking_list');
  const { t: t0 } = useTranslation('common'); // 加载 xxx.json 翻译文件

  const clearAllAtom = useClearAllAtom();
  const { data: warehouseData } = useGetWarehouse({ isActive: true });
  const { data: vendorsData } = useGetAllVendors({ type: 1 });
  const {
    mutate: searchMutate,
    data: orderListData,
    isLoading,
    serverError,
    setServerError,
  } = useSearchOutboundOrderList();

  const {
    mutate: deleteOrderById,
    data: deleteRes,
    isLoading: isDeleteLoading,
  } = useDeleteOutboundOrder();

  const {
    mutate: getPickingList,
    data: pickingListData,
    isLoading: isLoadingGetPickingList,
    serverError: pickingListDataError,
  } = useGetPickingListData();

  const {
    mutate: getBulkPickingList,
    data: bulkPickingListData,
    isLoading: isLoadingBulkPickingList,
    serverError: bulkPickingListError,
  } = useGetBulkPickingListData();

  // Use Effect  ---------------------------------------------

  useEffect(() => {
    clearAllAtom();
    refetchOrder();
  }, []);

  useEffect(() => {
    if (pickingOrderId) {
      const ids: string[] = [];
      ids.push(pickingOrderId as string);
      setBulkPickingOrderIds(ids);
    }
  }, [pickingOrderId]);

  useEffect(() => {
    refetchBulkPickingList();
  }, [bulkPickingOrderIds]);

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
  // function refetchPickingList() {
  //   if (typeof pickingOrderId === 'string' && !_.isEmpty(pickingOrderId)) {
  //     getPickingList({ id: pickingOrderId });
  //     setOpenPickingListDrawer(true);
  //     setOpenBulkPickingListDrawer(false);
  //   }
  // }
  function refetchBulkPickingList() {
    if (bulkPickingOrderIds && bulkPickingOrderIds.length > 0) {
      getBulkPickingList(bulkPickingOrderIds);
      setOpenPickingListDrawer(false);
      setOpenBulkPickingListDrawer(true);
    }
  }

  function refetchOrder() {
    searchMutate({
      params: { page: 1, pageSize: 200 },
      payload: { status: 2 },
    });
  }

  function onSubmit(data: ISearchOrderParams | any) {
    const payload: any = cleanObject({
      status: 2,
      seq_order_no: data.seq_order_no,
      batch_number: data.batch_number || '',
      highlight: data.highlight || '',
      invoice_no: data.invoice_no || '',
      start_date: data.start_date
        ? dayjs(data.start_date).format('YYYY-MM-DD')
        : '',
      end_date: data.end_date ? dayjs(data.end_date).format('YYYY-MM-DD') : '',
      remark: data.remark || '',
      vendorId: data.vendor ? data.vendor.value : '',
      warehouse_id: data.warehouse ? data.warehouse.value : '',
    });

    searchMutate({ params: { page: 1, pageSize: 200 }, payload });
  }

  return (
    <div>
      {/* {pickingListData?.data?.order && (
        <PickingListDrawer
          data={pickingListData.data}
          setPickingOrderId={setPickingOrderId}
          refetchOrder={refetchOrder}
          refetchPickingList={refetchPickingList}
        />
      )} */}
      {bulkPickingListData?.data && (
        <BulkPickingListDrawer
          data={bulkPickingListData.data}
          setBulkPickingOrderIds={setBulkPickingOrderIds}
          refetchOrder={refetchOrder}
          refetchBulkPickingList={refetchBulkPickingList}
        />
      )}
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
              {t('outbound_order')}
            </Breadcrumb.Item>
            <Breadcrumb.Item
              className="breadcrumb-item "
              active
              aria-current="page"
            >
              {t('title')}
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
                        <Form.Label>{t('lb_order_no')}</Form.Label>
                        <Form.Control
                          {...register('seq_order_no')}
                          placeholder="order number"
                          type="text"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={1} className=" mg-t-10 mg-md-t-0">
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
            <OutboundPickingOrderListDataTable
              orderListData={orderListData.data}
              setPickingOrderId={setPickingOrderId}
              setBulkPickingOrderIds={setBulkPickingOrderIds}
            />
          </>
        )}
      </div>
    </div>
  );
};
const OutboundOrderList = () => {
  return (
    <>
      <Main />
    </>
  );
};

OutboundOrderList.layout = 'Contentlayout';

// PurchaseOrderList.layout = 'Contentlayout';

export default OutboundOrderList;
