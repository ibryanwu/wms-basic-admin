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
import VendorListDataTable from '@/component-lib/data-table/meta/VendorListDT';
import { useAtom } from 'jotai';
import { openVendorModalAtom } from '@/stores/atom';
import { useGetAllVendors } from '@/rest/vendor';
import { useTranslation } from 'next-i18next';
import { getStaticTranslations } from '@/lib/i18n';
export async function getStaticProps({ locale }: { locale: string }) {
  return getStaticTranslations(locale, ['common', 'vendor', 'menu']);
}
const VendorList = () => {
  // Values  -------------------------------------------------
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [openVendorModal, setOpenVendorModal] = useAtom(openVendorModalAtom);

  // UseState  -----------------------------------------------
  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------
  const { mutate: getMe, data: me } = useMe();
  const { data: vendorListData, refetch } = useGetAllVendors({
    isActive: undefined,
  });
  // Use Effect  ---------------------------------------------
  useEffect(() => {
    getMe();
  }, []);
  useEffect(() => {
    if (openVendorModal === false) {
      refetch();
    }
  }, [openVendorModal]);

  const { t } = useTranslation('vendor');
  const { t: t0 } = useTranslation('common');

  // Function ------------------------------------------------
  return (
    <>
      {me?.role && me.role === 'ADMIN' ? (
        <div>
          <Seo title={'Vendor'} />

          {/* <!-- breadcrumb --> */}
          <div className="breadcrumb-header justify-content-between">
            <div className="left-content">
              <span className="main-content-title mg-b-0 mg-b-lg-1">
                {t('lb_vendor')}
              </span>
            </div>
            <div className="justify-content-center mt-2">
              <Breadcrumb className="breadcrumb">
                <Breadcrumb.Item className="breadcrumb-item tx-15" href="#!">
                  {t('lb_vendor')}
                </Breadcrumb.Item>
                <Breadcrumb.Item
                  className="breadcrumb-item "
                  active
                  aria-current="page"
                >
                  {t('lb_vendor_list')}
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
                        {t0('refresh')}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setOpenVendorModal(true);
                        }}
                      >
                        <i className="fe fe-plus me-2"></i>
                        {t('add_vendor')}
                      </Button>
                    </Stack>
                    <VendorListDataTable data={vendorListData?.data} />
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

VendorList.propTypes = {};
VendorList.defaultProps = {};
VendorList.layout = 'Contentlayout';
// BatchList.propTypes = {};
// BatchList.defaultProps = {};
// BatchList.layout = 'Contentlayout';

export default VendorList;
