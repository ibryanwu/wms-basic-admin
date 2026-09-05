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
  Stack,
} from 'react-bootstrap';
import Link from 'next/link';
import { Tododata } from '../../shared/data/pages/todotask';
import Seo from '@/shared/layout-components/seo/seo';
import { useGetGrossMarginEstimate } from '../../rest/report';
import GorssMarginEstDt from '@/component-lib/data-table/gorssMarginEstDt';
import { useMe } from '@/rest/auth';
import { useGetWarehouse } from '@/rest/inv';
import WarehouseListDataTable from '@/component-lib/data-table/meta/WarehouseListDT';
import { useAtom } from 'jotai';
import { openWarehouseModalAtom } from '@/stores/atom';
import { getStaticTranslations } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';
export async function getStaticProps({ locale }: { locale: string }) {
  return getStaticTranslations(locale, ['common', 'warehouse', 'menu']);
}
const WarehouseList = () => {
  // Values  -------------------------------------------------
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [openWarehouseModal, setOpenWarehouseModal] = useAtom(
    openWarehouseModalAtom,
  );

  // UseState  -----------------------------------------------
  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------
  const { t } = useTranslation('warehouse');
  const { t: t0 } = useTranslation('common');
  const { mutate: getMe, data: me } = useMe();
  const { data: warehouse, refetch } = useGetWarehouse({ isActive: undefined });
  // Use Effect  ---------------------------------------------
  useEffect(() => {
    getMe();
  }, []);

  useEffect(() => {
    if (openWarehouseModal === false) {
      refetch();
    }
  }, [openWarehouseModal]);

  // Function ------------------------------------------------
  return (
    <>
      {me?.role && me.role === 'ADMIN' ? (
        <div>
          <Seo title={'Warehouse'} />

          {/* <!-- breadcrumb --> */}
          <div className="breadcrumb-header justify-content-between">
            <div className="left-content">
              <span className="main-content-title mg-b-0 mg-b-lg-1">
                {t('lb_warehouse')}
              </span>
            </div>
            <div className="justify-content-center mt-2">
              <Breadcrumb className="breadcrumb">
                <Breadcrumb.Item className="breadcrumb-item tx-15" href="#!">
                  {t('lb_warehouse')}
                </Breadcrumb.Item>
                <Breadcrumb.Item
                  className="breadcrumb-item "
                  active
                  aria-current="page"
                >
                  {t('lb_warehouse_list')}
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
                  <>
                    <Stack direction="horizontal" gap={3} className="mg-b-10">
                      <Button
                        variant="primary"
                        onClick={() => {
                          refetch();
                        }}
                      >
                        {t0('btn_refresh')}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setOpenWarehouseModal(true);
                        }}
                      >
                        <i className="fe fe-plus me-2"></i>
                        {t('add_warehouse')}
                      </Button>
                    </Stack>
                    <WarehouseListDataTable data={warehouse?.data} />
                  </>
                </Col>
              </Row>
            </Col>
            {/* <!-- /col --> */}
          </Row>
          {/* <!-- row closed --> */}
        </div>
      ) : (
        'Unauthorized'
      )}
    </>
  );
};

WarehouseList.propTypes = {};
WarehouseList.defaultProps = {};
WarehouseList.layout = 'Contentlayout';
// BatchList.propTypes = {};
// BatchList.defaultProps = {};
// BatchList.layout = 'Contentlayout';

export default WarehouseList;
