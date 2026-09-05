'use client';
import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Seo from '@/shared/layout-components/seo/seo';
import { useGetGrossMarginEstimate } from '../../rest/report';

import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from 'react-table';
import {
  Breadcrumb,
  Col,
  Row,
  Card,
  Button,
  ProgressBar,
  Form,
  Spinner,
  Image,
} from 'react-bootstrap';
import Link from 'next/link';
import Select from 'react-select';
import * as Dashboarddata from '../../component-lib/dashboard';
import {
  COLUMNS,
  DATATABLE,
  GlobalFilter,
} from '@/shared/data/dashboards/dashboards1';
import { useToken } from '@/lib/hooks/use-token';
import { useRouter } from 'next/router';
import { useFetchDayTotalizer, useGetTotalizersView } from '@/rest/report';
import { mobileWidth } from '@/lib/sys';
import dayjs from 'dayjs';
import { useMe } from '@/rest/auth';
import { convertPrice } from '@/utils/public';
import Location from '../location';
import { getStaticTranslations } from '@/lib/i18n';

export async function getStaticProps({ locale }) {
  return getStaticTranslations(locale, ['common', 'dashboard', 'menu']);
}
const Dashboard = () => {
  // Values  -------------------------------------------------
  const { hasToken } = useToken();
  const routes = useRouter();
  const today = dayjs(new Date()).format('YYYY-MM-DD');
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  // UseState  -----------------------------------------------
  const [windowWidth, setWindowWidth] = useState();
  const [count, setCount] = useState(0); //刷新汇总数据

  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------
  const { mutate: getMe, data: me } = useMe();

  // Use Effect  ---------------------------------------------

  useEffect(() => {
    getMe();
    // 在客户端渲染时才执行的代码
    if (typeof window !== 'undefined') {
      // 在这里可以安全地访问 window 对象
      setWindowWidth(window.innerWidth);
      console.log(
        '🚀 ~ file: index.jsx:241 ~ useEffect ~ window.innerWidth:',
        window.innerWidth,
      );
    }
  }, []);

  useEffect(() => {
    if (!hasToken()) {
      routes.push('/login');
    }
  }, [hasToken()]);

  // Function ------------------------------------------------

  return (
    <>
      {me?.role && me.role === 'ADMIN' ? (
        <div>
          <Seo title={'Dashboard1'} />
          <React.Fragment>
            <div className="breadcrumb-header justify-content-between">
              <div className="left-content">
                <span className="main-content-title mg-b-0 mg-b-lg-1">
                  DASHBOARD{' '}
                </span>
              </div>
              <div className="justify-content-center mt-2">
                <Breadcrumb>
                  <Breadcrumb.Item className=" tx-15" href="#!">
                    Dashboard
                  </Breadcrumb.Item>
                  <Breadcrumb.Item active aria-current="page">
                    Sales
                  </Breadcrumb.Item>
                </Breadcrumb>
              </div>
            </div>
            {/* <!-- /breadcrumb --> */}

            {/* <!-- row --> */}
            <Row>
              <Col xxl={12} xl={12} lg={12} md={12} sm={12}>
                <Row>
                  <Col xl={3} lg={12} md={12} xs={12}>
                    <Card className=" sales-card">
                      <Row>
                        <div className="col-8">
                          <div className="ps-4 pt-4 pe-3 pb-4">
                            <div className="">
                              <h6 className="mb-2 tx-12 ">Today Total Sales</h6>
                            </div>
                            <div className="pb-0 mt-0">
                              <div className="d-flex">
                                <h4 className="tx-20 font-weight-semibold mb-2">
                                  $ 100
                                </h4>
                              </div>
                              <p className="mb-0 tx-12 text-muted">
                                Last week
                                <i className="fa fa-caret-up mx-2 text-success"></i>
                                <span className="text-success font-weight-semibold">
                                  0
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="circle-icon bg-primary-transparent text-center align-self-center overflow-hidden">
                            <i className="fe fe-shopping-bag tx-16 text-primary"></i>
                          </div>
                        </div>
                      </Row>
                    </Card>
                  </Col>
                  <Col xl={3} lg={12} md={12} xs={12}>
                    <Card className="sales-card">
                      <Row>
                        <div className="col-8">
                          <div className="ps-4 pt-4 pe-3 pb-4">
                            <div className="">
                              <h6 className="mb-2 tx-12">Today Net Sales</h6>
                            </div>
                            <div className="pb-0 mt-0">
                              <div className="d-flex">
                                <h4 className="tx-20 font-weight-semibold mb-2">
                                  $ 120
                                </h4>
                              </div>
                              <p className="mb-0 tx-12 text-muted">
                                Last week
                                <i className="fa fa-caret-down mx-2 text-danger"></i>
                                <span className="font-weight-semibold text-danger">
                                  0
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="circle-icon bg-info-transparent text-center align-self-center overflow-hidden">
                            <i className="fe fe-dollar-sign tx-16 text-info"></i>
                          </div>
                        </div>
                      </Row>
                    </Card>
                  </Col>
                  <Col xl={3} lg={12} md={12} xs={12}>
                    <Card className=" sales-card">
                      <Row>
                        <div className="col-8">
                          <div className="ps-4 pt-4 pe-3 pb-4">
                            <div className="">
                              <h6 className="mb-2 tx-12">Today Cash</h6>
                            </div>
                            <div className="pb-0 mt-0">
                              <div className="d-flex">
                                <h4 className="tx-20 font-weight-semibold mb-2">
                                  $ 130
                                </h4>
                              </div>
                              <p className="mb-0 tx-12 text-muted">
                                Last week
                                <i className="fa fa-caret-up mx-2 text-success"></i>
                                <span className=" text-success font-weight-semibold">
                                  0
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="circle-icon bg-secondary-transparent text-center align-self-center overflow-hidden">
                            <i className="fe fe-external-link tx-16 text-secondary"></i>
                          </div>
                        </div>
                      </Row>
                    </Card>
                  </Col>
                  <Col xl={3} lg={12} md={12} xs={12}>
                    <Card className="sales-card">
                      <Row>
                        <div className="col-8">
                          <div className="ps-4 pt-4 pe-3 pb-4">
                            <div className="">
                              <h6 className="mb-2 tx-12">Total HST</h6>
                            </div>
                            <div className="pb-0 mt-0">
                              <div className="d-flex">
                                <h4 className="tx-22 font-weight-semibold mb-2">
                                  $ 140
                                </h4>
                              </div>
                              <p className="mb-0 tx-12  text-muted">
                                Last week
                                <i className="fa fa-caret-down mx-2 text-danger"></i>
                                <span className="text-danger font-weight-semibold">
                                  0
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="circle-icon bg-warning-transparent text-center align-self-center overflow-hidden">
                            <i className="fe fe-credit-card tx-16 text-warning"></i>
                          </div>
                        </div>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              </Col>

              {/* <!-- </div> --> */}
            </Row>
            <Location />
            {/* <!-- row closed --> */}

            {/* <!-- row  --> */}
          </React.Fragment>
        </div>
      ) : (
        '未授权'
      )}
    </>
  );
};
Dashboard.layout = 'Contentlayout';

export default Dashboard;
