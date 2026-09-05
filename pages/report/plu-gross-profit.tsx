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
import { Button, ButtonGroup } from '@mui/joy';
import {
  Breadcrumb,
  Col,
  Row,
  Form,
  Card,
  Stack,
  InputGroup,
} from 'react-bootstrap';
import Link from 'next/link';
import dayjs from 'dayjs';

import { useMe } from '@/rest/auth';
import { useForm } from 'react-hook-form';

import {
  deleteOrderIdAtom,
  pluPurHistoryAtom,
  useClearAllAtom,
} from '@/stores/atom';
import { useAtom } from 'jotai';
import { toast } from 'react-toastify';
import {
  useAnalysisGrossProfitPLUSalesByDay,
  useGetSubDeptOptions,
} from '@/rest/report';
import GrossProfitAnalysis from '@/component-lib/data-table/GrossProfitAnalysis';
import PluHistory from '@/component-lib/data-table/PluHistoryDT';

const Main = () => {
  // Values  -------------------------------------------------
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [pluHist] = useAtom(pluPurHistoryAtom);

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
    defaultValues: {
      date: dayjs().subtract(1, 'day').toDate(),
      ratio2: 0.4,
      ratio1: undefined,
    },
  });
  // Hooks  --------------------------------------------------
  const { mutate: getMe, data: me, isLoading: isLoadingMe, isMe } = useMe();
  const clearAllAtom = useClearAllAtom();
  const { data: subDeptOptions } = useGetSubDeptOptions();

  const {
    mutate: searchMutate,
    data: analysisData,
    isLoading,
    serverError,
    setServerError,
  } = useAnalysisGrossProfitPLUSalesByDay();

  // Use Effect  ---------------------------------------------

  useEffect(() => {
    clearAllAtom();
  }, []);

  // Function ------------------------------------------------

  function onSubmit(data: any) {
    if (!data.date) return;
    const payload: any = {
      date: dayjs(data.date).format('YYYY-MM-DD'),
      subDept: data.subDept?.value || undefined,
      ratio1: data.ratio1 || undefined,
      ratio2: data.ratio2 || 99,
    };
    console.log('🚀 ~ file: order-list.tsx:91 ~ onSubmit ~ payload:', payload);
    searchMutate(payload);
  }
  return (
    <div>
      <Seo title={'Product Form'} /> {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            PLU Gross Profit Analysis
          </span>
        </div>

        <div className="justify-content-center mt-2">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item
              className="breadcrumb-item tx-15"
              href="./index.tsx"
            >
              PLU Gross Profit
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
                      xs={2}
                      lg={2}
                      xl={2}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 99 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>Date</Form.Label>
                        <InputGroup className="input-group reactdate-pic">
                          <InputGroup.Text className="input-group-text">
                            <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                          </InputGroup.Text>
                          <Datepicker
                            key="date"
                            name="date"
                            control={control}
                            isMulti={false}
                            rules={{ required: 'Date is required' }}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col
                      md={2}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 999 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>Department</Form.Label>
                        {subDeptOptions?.data && (
                          <SelectPro
                            key="subDept"
                            name="subDept"
                            control={control}
                            defaultValue={undefined}
                            options={subDeptOptions.data}
                            isMulti={false}
                            rules={{ required: 'Department is required' }}
                            filterOption={undefined}
                            isDisabled={false}
                            onChangeHandler={() => {}}
                            //isDisabled={itemListDatas?.length > 0}
                          />
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={2} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>
                          Ratio {'> ('} Between 0~1 {')'}
                        </Form.Label>
                        <Form.Control
                          {...register('ratio1')}
                          placeholder="利润率大于"
                          type="text"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={2} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>
                          Ratio {'< ('} Between 0~1 {')'}{' '}
                        </Form.Label>
                        <Form.Control
                          {...register('ratio2')}
                          placeholder="利润率小于"
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
                          Search
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
      <Row>
        <Col md={pluHist && pluHist.length > 0 ? 7 : 12}>
          <GrossProfitAnalysis
            analysisData={analysisData}
          ></GrossProfitAnalysis>
        </Col>
        {pluHist && pluHist.length > 0 ? (
          <Col md={5}>
            <PluHistory />
          </Col>
        ) : null}
      </Row>
    </div>
  );
};

const AnalysisGrossProfitPLUSalesByDay = () => {
  return (
    <>
      <Main />
    </>
  );
};

AnalysisGrossProfitPLUSalesByDay.layout = 'Contentlayout';
// PurchaseOrderList.layout = 'Contentlayout';

export default AnalysisGrossProfitPLUSalesByDay;
