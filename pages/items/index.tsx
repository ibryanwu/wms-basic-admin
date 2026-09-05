import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Row,
  Breadcrumb,
  Form,
  Stack,
} from 'react-bootstrap';
import Seo from '@/shared/layout-components/seo/seo';
import SelectPro from '../../component-lib/select';
import { useMe } from '@/rest/auth';
import { useGetWarehouse } from '@/rest/inv';
import MetaItemListDataTable from '@/component-lib/data-table/meta/ItemListDT';
import { useAtom } from 'jotai';
import { openItemModalAtom, openVendorModalAtom } from '@/stores/atom';
import { useGetAllItems, useSearchItems, useSyncAllItems } from '@/rest/items';
import { useGetCategory } from '@/rest/category';
import { useForm } from 'react-hook-form';
import { useGetAllVendors } from '@/rest/vendor';
import { VendorDialog } from '@/component-lib/modal/meta/VendorDialog';
import { getStaticTranslations } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { toastOptions } from '@/utils/public';

export async function getStaticProps({ locale }: { locale: string }) {
  return getStaticTranslations(locale, ['common', 'items', 'menu']);
}
const MetaItemList = () => {
  // Values  -------------------------------------------------
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [openItemModal, setOpenItemModal] = useAtom(openItemModalAtom);
  const [openVendorModal, setOpenVendorModal] = useAtom(openVendorModalAtom);

  // UseState  -----------------------------------------------
  const [isSync, setIsSync] = useState(false);
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
    //values: defaultFormDate,
  });
  // Hooks  --------------------------------------------------
  const { t: t0 } = useTranslation('common'); // 加载 xxx.json 翻译文件
  const { t } = useTranslation('items'); // 加载 xxx.json 翻译文件
  const { mutate: getMe, data: me } = useMe();
  const { options: categoryDataOptions } = useGetCategory({ isActive: true });
  const {
    mutate: searchMutate,
    data: metaItemListData,
    isLoading,
    serverError,
    setServerError,
  } = useSearchItems();
  const {
    mutate: syncAllItemsMutate,
    data: syncAllItemsData,
    isLoading: syncAllItemsLoading,
    serverError: syncAllItemsServerError,
    setServerError: setSyncAllItemsServerError,
  } = useSyncAllItems();

  const { data: vendorsData, refetch: refetchVendor } = useGetAllVendors({
    type: 1,
    isActive: true,
    isOnlyOwnItem: true,
  });

  // Use Effect  ---------------------------------------------
  useEffect(() => {
    getMe();
  }, []);

  useEffect(() => {
    if (openVendorModal === false) {
      refetchVendor();
    }
  }, [openVendorModal]);

  useEffect(() => {
    if (openItemModal === false) {
      searchMutate({ params: { page: 1, pageSize: 400 }, payload: {} });
    }
  }, [openItemModal]);

  useEffect(() => {
    if (syncAllItemsData) {
      if (syncAllItemsData.code === 0) {
        toast.success(t('sync_success'), toastOptions);
        searchMutate({ params: { page: 1, pageSize: 400 }, payload: {} });
      } else {
        toast.error(t('sync_error'), toastOptions);
      }
    }
  }, [syncAllItemsData]);

  // Function ------------------------------------------------
  function onSubmit(data: any) {
    const payload: any = {
      search: data.search || '',
    };
    if (data.vendor) {
      payload.vendorId = data.vendor.value;
    }
    if (data.category) {
      payload.categoryId = data.category.value;
    }

    searchMutate({ params: { page: 1, pageSize: 200 }, payload });
  }

  return (
    <>
      <VendorDialog
        editingItem={undefined}
        showAddBt={false}
        setEditItem={undefined}
      />
      <div>
        <Seo title={'Item List'} />

        {/* <!-- breadcrumb --> */}
        <div className="breadcrumb-header justify-content-between">
          <div className="left-content">
            <span className="main-content-title mg-b-0 mg-b-lg-1">Items</span>
          </div>
          <div className="justify-content-center mt-2">
            <Breadcrumb className="breadcrumb">
              <Breadcrumb.Item className="breadcrumb-item tx-15" href="#!">
                Items
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
                      <Col md={4} xs={12} className=" mg-t-10 mg-md-t-0">
                        <Form.Group className="form-group">
                          <Form.Label>{t('lb_search')}</Form.Label>
                          <Form.Control
                            {...register('search')}
                            placeholder="Name/Sku/Spec"
                            type="text"
                          />
                        </Form.Group>
                      </Col>
                      <Col
                        md={3}
                        className=" mg-t-10 mg-md-t-0"
                        style={{ zIndex: 999 }}
                      >
                        <Form.Group className="form-group">
                          <Form.Label>{t('lb_category')}</Form.Label>
                          {categoryDataOptions && (
                            <SelectPro
                              key="category"
                              name="category"
                              control={control}
                              defaultValue={undefined}
                              options={categoryDataOptions}
                              isMulti={false}
                              rules={{}}
                              filterOption={undefined}
                              isDisabled={false}
                              onChangeHandler={undefined}
                            />
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={5} className=" mg-t-10 mg-md-t-0">
                        <Form.Group className="form-group">
                          <Form.Label>
                            <a
                              onClick={() => {
                                setOpenVendorModal(true);
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              {t('lb_vendor')}
                              <span className=" text-success">{'[NEW]'}</span>
                            </a>
                          </Form.Label>
                          <>
                            {vendorsData?.data && (
                              <div style={{ zIndex: 892 }}>
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

                                  //isDisabled={itemListDatas?.length > 0}
                                />
                              </div>
                            )}
                          </>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12} className=" mg-t-10 mg-md-t-0">
                        <Row>
                          <Form.Group className="form-group">
                            <Form.Label>
                              <span className="tx-white">.</span>
                            </Form.Label>
                            <Button
                              className="btn btn-warning"
                              disabled={isLoading}
                              onClick={() => {
                                reset({
                                  search: '',
                                  category: {},
                                  vendor: {},
                                });
                              }}
                            >
                              {t0('btn_reset')}
                            </Button>
                          </Form.Group>
                          <Form.Group className="form-group">
                            <Form.Label>
                              <span className="tx-white">.</span>
                            </Form.Label>
                            <Button type="submit" disabled={isLoading}>
                              {t0('btn_search')}
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
        {/* <!-- row --> */}
        <Row className="row-sm">
          {/* <!-- col --> */}
          <Col xl={12} md={12}>
            <Row className=" row-sm">
              {/* <!-- /col --> */}
              <Col lg={12}>
                {metaItemListData && metaItemListData?.data.length > 0 ? (
                  <>
                    <Stack direction="horizontal" gap={3} className="mg-b-10">
                      <Button
                        variant="primary"
                        onClick={() => {
                          setOpenItemModal(true);
                        }}
                        disabled={syncAllItemsLoading}
                      >
                        {t0('btn_new')}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setIsSync(true);
                          syncAllItemsMutate();
                        }}
                        disabled={syncAllItemsLoading}
                      >
                        {t('btn_sync')}{' '}
                        {syncAllItemsLoading && t('btn_sync_loading')}
                      </Button>
                    </Stack>
                    <MetaItemListDataTable data={metaItemListData?.data} />
                  </>
                ) : null}
              </Col>
            </Row>
          </Col>
          {/* <!-- /col --> */}
        </Row>
        {/* <!-- row closed --> */}
      </div>
    </>
  );
};

MetaItemList.propTypes = {};
MetaItemList.layout = 'Contentlayout';
// BatchList.propTypes = {};
// BatchList.defaultProps = {};
// BatchList.layout = 'Contentlayout';

export default MetaItemList;
