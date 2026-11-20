import React, { useEffect } from 'react';
import {
  Button,
  Card,
  Col,
  Row,
  Breadcrumb,
  Dropdown,
  OverlayTrigger,
  Tooltip,
  Image,
} from 'react-bootstrap';
import Link from 'next/link';
import { Tododata } from '../../shared/data/pages/todotask';
import Seo from '@/shared/layout-components/seo/seo';
import { useGetGrossMarginEstimate } from '../../rest/report';
import GorssMarginEstDt from '@/component-lib/data-table/gorssMarginEstDt';
import { useMe } from '@/rest/auth';
import { useHasPagePermission } from '@/utils/public';
import Unauthorized from '@/component-lib/auth/Unauthorized';

const BatchList = () => {
  // Values  -------------------------------------------------
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  // UseState  -----------------------------------------------
  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------
  const { mutate: getMe } = useMe();
  const canAccess = useHasPagePermission('page.dashboard');
  const { data: grossMarginEst } = useGetGrossMarginEstimate();
  // Use Effect  ---------------------------------------------
  useEffect(() => {
    getMe();
  }, []);

  // Function ------------------------------------------------
  return (
    <>
      {canAccess ? (
        <div>
          <Seo title={'BatchList'} />

          {/* <!-- breadcrumb --> */}
          <div className="breadcrumb-header justify-content-between">
            <div className="left-content">
              <span className="main-content-title mg-b-0 mg-b-lg-1">
                Batch Heath Analysis
              </span>
            </div>
            <div className="justify-content-center mt-2">
              <Breadcrumb className="breadcrumb">
                <Breadcrumb.Item className="breadcrumb-item tx-15" href="#!">
                  Report
                </Breadcrumb.Item>
                <Breadcrumb.Item
                  className="breadcrumb-item "
                  active
                  aria-current="page"
                >
                  Batch Heath Analysis
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>
          {/* <!-- /breadcrumb --> */}

          {/* <!-- row --> */}
          <Row className="row-sm">
            {/* <!-- col --> */}
            <Col xl={12} md={12}>
              <Row className=" row-sm">
                {/* <!-- /col --> */}
                <Col lg={12}>
                  {grossMarginEst?.data && grossMarginEst?.data.length > 0 ? (
                    <>
                      <GorssMarginEstDt grossMarginEst={grossMarginEst} />
                    </>
                  ) : null}
                </Col>
              </Row>
            </Col>
            {/* <!-- /col --> */}
          </Row>
          {/* <!-- row closed --> */}
        </div>
      ) : (
        <Unauthorized />
      )}
    </>
  );
};

BatchList.propTypes = {};
BatchList.defaultProps = {};
BatchList.layout = 'Contentlayout';
// BatchList.propTypes = {};
// BatchList.defaultProps = {};
// BatchList.layout = 'Contentlayout';

export default BatchList;
