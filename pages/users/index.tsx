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
import { useAtom } from 'jotai';
import { openUserModalAtom } from '@/stores/atom';
import { useGetAllVendors } from '@/rest/vendor';
import { useGetAllUser } from '@/rest/users';
import UserListDataTable from '@/component-lib/data-table/meta/UserListDT';
import { getStaticTranslations } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';

export async function getStaticProps({ locale }: { locale: string }) {
  return getStaticTranslations(locale, ['common', 'user', 'menu']);
}

const UserList = () => {
  // Values  -------------------------------------------------
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [openUserModal, setOpenUserModal] = useAtom(openUserModalAtom);

  // UseState  -----------------------------------------------
  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------
  const { t } = useTranslation('user');
  const { t: t0 } = useTranslation('common');
  const { mutate: getMe, data: me } = useMe();
  const { data: userListData, refetch } = useGetAllUser({
    isActive: undefined,
  });
  // Use Effect  ---------------------------------------------
  useEffect(() => {
    getMe();
  }, []);
  useEffect(() => {
    if (openUserModal === false) {
      refetch();
    }
  }, [openUserModal]);

  // Function ------------------------------------------------
  return (
    <>
      {me?.role && me.role === 'ADMIN' ? (
        <div>
          <Seo title={'User List'} />

          {/* <!-- breadcrumb --> */}
          <div className="breadcrumb-header justify-content-between">
            <div className="left-content">
              <span className="main-content-title mg-b-0 mg-b-lg-1">
                {t('lb_user')}
              </span>
            </div>
            <div className="justify-content-center mt-2">
              <Breadcrumb className="breadcrumb">
                <Breadcrumb.Item className="breadcrumb-item tx-15" href="#!">
                  {t('lb_user')}
                </Breadcrumb.Item>
                <Breadcrumb.Item
                  className="breadcrumb-item "
                  active
                  aria-current="page"
                >
                  {t('lb_user_list')}
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
                  {userListData?.data && userListData?.data.length > 0 ? (
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
                            setOpenUserModal(true);
                          }}
                        >
                          <i className="fe fe-plus me-2"></i>
                          {t('add_user')}
                        </Button>
                      </Stack>
                      <UserListDataTable data={userListData.data} />
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
        'Unauthorized'
      )}
    </>
  );
};

UserList.propTypes = {};
UserList.defaultProps = {};
UserList.layout = 'Contentlayout';
// BatchList.propTypes = {};
// BatchList.defaultProps = {};
// BatchList.layout = 'Contentlayout';

export default UserList;
