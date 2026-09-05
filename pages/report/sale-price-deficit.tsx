import React, { useEffect, useState } from 'react';
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
import { useGetItemsSalePriceDeficit } from '../../rest/report';
import GorssMarginEstDt from '@/component-lib/data-table/gorssMarginEstDt';
import { useMe } from '@/rest/auth';
import ItemsSalePriceDeficit from '@/component-lib/data-table/ItemsSalePriceDeficit';

const BatchList = () => {
  // Values  -------------------------------------------------
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  // UseState  -----------------------------------------------
  const [grossMargin, setGrossMargin] = useState({ grossMargin: 1.38 });
  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------
  const { mutate: getMe, data: me } = useMe();
  const { data: itemsSalePriceDeficit, refetch } =
    useGetItemsSalePriceDeficit(grossMargin);
  // Use Effect  ---------------------------------------------
  useEffect(() => {
    getMe();
    refetch();
  }, []);

  useEffect(() => {
    console.log('🚀 ~ useEffect ~ me:', me);
  }, [me]);

  // Function ------------------------------------------------
  return (
    <>
      {me?.role && me.role === 'ADMIN' ? (
        <div>
          <Seo title={'BatchList'} />

          {/* <!-- breadcrumb --> */}
          <div className="breadcrumb-header justify-content-between">
            <div className="left-content">
              <span className="main-content-title mg-b-0 mg-b-lg-1">
                Sale Price Deficit
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
                  Sale Price Deficit
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
                  {itemsSalePriceDeficit?.data &&
                  itemsSalePriceDeficit?.data.length > 0 ? (
                    <>
                      <ItemsSalePriceDeficit
                        itemsSalePriceDeficit={itemsSalePriceDeficit}
                        grossMargin={grossMargin}
                      />
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
        '未授权'
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
