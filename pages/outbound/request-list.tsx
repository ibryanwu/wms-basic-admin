'use client';
import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Seo from '@/shared/layout-components/seo/seo';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});
import SelectPro from '../../component-lib/select';

import Datepicker from '../../component-lib/form-ele';
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

import { ISearchParams } from '@/types/inbound';
import { deleteOrderIdAtom, useClearAllAtom } from '@/stores/atom';
import { useAtom } from 'jotai';
import { toast } from 'react-toastify';
import { useGetWarehouse } from '@/rest/inv';
import {
  exportOutboundListToCSV,
  orderTypeOptions,
} from '@/service/outbound-request';
import OutboundRequestListDataTable from '@/component-lib/data-table/OutboundRequestListDt';
import { cleanObject } from '@/utils/public';
import {
  useDeleteOutboundRequest,
  useSearchOutboundRequestList,
} from '@/rest/outbound-request';

const Main = () => {
  // Values  -------------------------------------------------
  const searchStartDay = dayjs().subtract(2, 'month').startOf('month').toDate();
  const searchEndDay = dayjs().add(2, 'day').toDate();

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
  const { data: vendorsData } = useGetAllVendors({
    type: 2,
    isOnlyOwnItem: true,
  });

  const clearAllAtom = useClearAllAtom();
  const {
    mutate: searchMutate,
    data: orderListData,
    isLoading,
    serverError,
    setServerError,
  } = useSearchOutboundRequestList();

  // Use Effect  ---------------------------------------------

  useEffect(() => {
    clearAllAtom();
    handleSubmit(onSubmit)();
  }, []);

  // Function ------------------------------------------------
  const resetSearch = () => {
    reset(defaultSearchData);
  };
  function onSubmit(data: ISearchParams | any) {
    console.log('🚀 ~ file: order-list.tsx:62 ~ Main ~ data:', data);
    const payload: any = cleanObject({
      batchNumber: data.batchNumber || '',
      invoiceNo: data.invoiceNo || '',
      startDate: data.startDate
        ? dayjs(data.start_date).format('YYYY-MM-DD')
        : '',
      endDate: data.endDate ? dayjs(data.endDate).format('YYYY-MM-DD') : '',
      remark: data.remark || '',
      vendorId: data.vendor ? data.vendor.value : undefined,
      warehouseId: data.warehouse ? data.warehouse.value : undefined,
    });

    console.log('🚀 ~ file: order-list.tsx:91 ~ onSubmit ~ payload:', payload);
    searchMutate({ params: { page: 1, pageSize: 200 }, payload });
  }

  return (
    <div>
      <Seo title={'Product Form'} /> {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Inbound Request List
          </span>
        </div>

        <div className="justify-content-center mt-2">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item
              className="breadcrumb-item tx-15"
              href="./index.tsx"
            >
              Outbound-Request
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
                        <Form.Label>Customer</Form.Label>
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
                      xs={12}
                      lg={2}
                      xl={2}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 99 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>Request Start Date</Form.Label>
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
                              rules={{ required: 'Request Date is required' }}
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
                        <Form.Label>End Date</Form.Label>
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
                        <Form.Label>Remark</Form.Label>
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
                            Reset
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
                            Search
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
                      exportOutboundListToCSV(orderListData.data);
                    }}
                  >
                    <i className="fa fa-table mg-r-4"></i>
                    Export CSV
                  </Button>
                </Stack>
              </Col>
            </Row>
            <div>
              <OutboundRequestListDataTable
                orderListData={orderListData.data}
                refreshList={() => {
                  handleSubmit(onSubmit)();
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
const InboundRequestList = () => {
  return (
    <>
      <Main />
    </>
  );
};

InboundRequestList.layout = 'Contentlayout';

// PurchaseRequestList.layout = 'Contentlayout';

export default InboundRequestList;
