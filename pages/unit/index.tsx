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

import Seo from '@/shared/layout-components/seo/seo';

import { useMe } from '@/rest/auth';
import UnitListDataTable from '@/component-lib/data-table/meta/UnitListDT';
import { useAtom } from 'jotai';
import { openUnitModalAtom } from '@/stores/atom';
import { useGetAllUnits } from '@/rest/unit';
import { getStaticTranslations } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';

export async function getStaticProps({ locale }: { locale: string }) {
  return getStaticTranslations(locale, ['common', 'unit', 'menu']);
}

const UnitList = () => {
  // Values  -------------------------------------------------
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [openUnitModal, setOpenUnitModal] = useAtom(openUnitModalAtom);

  // UseState  -----------------------------------------------
  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------
  const { mutate: getMe, data: me } = useMe();
  const { data: unitListData, refetch } = useGetAllUnits({
    isActive: undefined,
  });
  // Use Effect  ---------------------------------------------
  useEffect(() => {
    getMe();
  }, []);
  useEffect(() => {
    if (openUnitModal === false) {
      refetch();
    }
  }, [openUnitModal]);

  const { t } = useTranslation('unit');
  const { t: t0 } = useTranslation('common');

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
                {t('lb_unit')}
              </span>
            </div>
            <div className="justify-content-center mt-2">
              <Breadcrumb className="breadcrumb">
                <Breadcrumb.Item className="breadcrumb-item tx-15" href="#!">
                  {t('lb_unit')}
                </Breadcrumb.Item>
                <Breadcrumb.Item
                  className="breadcrumb-item "
                  active
                  aria-current="page"
                >
                  {t('lb_unit_list')}
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
                          setOpenUnitModal(true);
                        }}
                      >
                        <i className="fe fe-plus me-2"></i>
                        {t('add_unit')}
                      </Button>
                    </Stack>
                    <UnitListDataTable data={unitListData} />
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

UnitList.propTypes = {};
UnitList.defaultProps = {};
UnitList.layout = 'Contentlayout';
// BatchList.propTypes = {};
// BatchList.defaultProps = {};
// BatchList.layout = 'Contentlayout';

export default UnitList;
