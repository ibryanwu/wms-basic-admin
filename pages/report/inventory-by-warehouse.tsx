'use client';
import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Seo from '@/shared/layout-components/seo/seo';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});
import SelectPro from '../../component-lib/select';
import Select from 'react-select';
import { useToken } from '@/lib/hooks/use-token';
import { useRouter } from 'next/router';
import Datepicker from '../../component-lib/form-ele';
import { ButtonGroup } from '@mui/joy';
import {
  Breadcrumb,
  Col,
  Row,
  Form,
  Card,
  Stack,
  Button,
} from 'react-bootstrap';
import Link from 'next/link';
import dayjs from 'dayjs';

import { useMe } from '@/rest/auth';
import { useForm, Controller } from 'react-hook-form';

import { useClearAllAtom } from '@/stores/atom';
import {
  useGetWarehouse,
  useSearchItemsInventoryByWarehouse,
} from '@/rest/inv';
import { useItemSummarize } from '@/rest/inventory';
import ItemInvSummarize from '@/component-lib/data-table/ItemInvSummarize';
import { useGetAllVendors } from '@/rest/vendor';
import { useGetAllItems } from '@/rest/items';
import { exportInventoryByWarehouseToCSV } from '@/service/report';
import { customFilterForSelect } from '@/service/items';
import { getStaticTranslations } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';
export async function getStaticProps({ locale }: { locale: string }) {
  return getStaticTranslations(locale, ['common', 'inventory_warehouse', 'menu']);
}
const Main = () => {
  // Values  -------------------------------------------------
  const defaultSearchData = {
    search: '',
    item: {},
    vendor: {},
    warehouse: {},
    locationCode: '',
  };
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------

  // UseState  -----------------------------------------------
  const [summarizeData, setSummarizeData] = useState<any>();
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
  const { t: t0 } = useTranslation('common'); // 加载 xxx.json 翻译文件
  const { t } = useTranslation('inventory_warehouse'); // 加载 xxx.json 翻译文件
  const clearAllAtom = useClearAllAtom();
  const { data: vendorsData } = useGetAllVendors({ type: 1 });

  //const { options: allItemsOptions } = useGetAllItems({ isActive: true });
  const { data: warehouseData } = useGetWarehouse({ isActive: true });

  const {
    mutate: searchMutate,
    data: invData,
    isLoading,
    serverError,
    setServerError,
  } = useItemSummarize();

  const {
    mutate: getItemOptions,
    options: allItemsOptions,
    isLoading: isLoadingAllItemsOptions,
    serverError: allItemsOptionsDataError,
  } = useGetAllItems();

  // Use Effect  ---------------------------------------------

  useEffect(() => {
    clearAllAtom();
    searchMutate({ params: { page: 1, pageSize: 200 }, payload: {} });
    getItemOptions({ isActive: true });
  }, []);

  useEffect(() => {
    console.log('🚀 ~ useEffect ~ summarizeData777:', summarizeData);

    if (invData?.data) {
      setSummarizeData(invData?.data);
    }
  }, [invData]);

  // Function ------------------------------------------------
  //自定义查询  返回boolean类型
  //searchFields.some(...) 用于检查 searchFields 数组中是否有至少一个字段（field）包含 inputValue
  const customFilter = (option: any, inputValue: any) => {
    return customFilterForSelect(option, inputValue);
  };

  const resetSearch = () => {
    reset(defaultSearchData);
  };
  function onSubmit(data: any) {
    console.log('data0098', data);
    if (!data) return;
    const payload: any = {
      search: data.search,
      itemId: data.item ? data.item.value : '',
      vendorId: data.vendor ? data.vendor.value : '',
      warehouseId: data.warehouse ? data.warehouse.value : '',
    };
    searchMutate({ params: { page: 1, pageSize: 200 }, payload });
  }
  return (
    <div>
      <Seo title={'Product Form'} /> {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            {t('title')}
          </span>
        </div>

        <div className="justify-content-center mt-2">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item
              className="breadcrumb-item tx-15"
              href="./index.tsx"
            >
              {t('title')}
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
                      md={4}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 999 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_items_search')}</Form.Label>
                        <Form.Control
                          {...register('search', {
                            required: false,
                          })}
                          placeholder="SKU/Barcode/name/spec/remarks..."
                          type="text"
                          style={{ textAlign: 'left' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col
                      md={3}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 200 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_items')}</Form.Label>
                        {allItemsOptions && (
                          <div>
                            <Controller
                              key="item"
                              // @ts-ignore
                              name="item"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  className=""
                                  value={field.value}
                                  // rules={{ required: 'Username is required' }}
                                  onChange={(value) => {
                                    field.onChange(value);
                                  }}
                                  // @ts-ignore
                                  options={allItemsOptions}
                                  isMulti={false}
                                  // @ts-ignore
                                  rules={{ required: 'Item is required' }}
                                  filterOption={customFilter}
                                />
                              )}
                            />
                          </div>
                        )}
                      </Form.Group>
                    </Col>

                    <Col
                      md={3}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 999 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_warehouse')}</Form.Label>
                        {warehouseData?.data && (
                          <SelectPro
                            key="warehouse"
                            name="warehouse"
                            control={control}
                            defaultValue={undefined}
                            options={warehouseData.data}
                            isMulti={false}
                            rules={{ required: 'Warehouse is required' }}
                            filterOption={undefined}
                            isDisabled={false}
                            onChangeHandler={undefined}
                            //isDisabled={itemListDatas?.length > 0}
                          />
                        )}
                      </Form.Group>
                    </Col>

                    <Col
                      md={2}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 198 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_vendor')}</Form.Label>
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
                            //isDisabled={itemListDatas?.length > 0}
                          />
                        )}
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
                            {t0('reset')}
                          </Button>
                        </Form.Group>
                        <Form.Group className="form-group">
                          <Form.Label>
                            <span className="tx-white">.</span>
                          </Form.Label>
                          <Button type="submit" disabled={isLoading}>
                            {t0('search')}
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
      <Row>
        <Col md={12}>
          {summarizeData?.data && (
            <Stack direction="vertical" gap={2}>
              <div>
                <Button
                  variant="primary"
                  onClick={() => {
                    exportInventoryByWarehouseToCSV(summarizeData?.data);
                  }}
                >
                  <i className="fa fa-table mg-r-4"></i>
                  {t0('btn_export')}
                </Button>
              </div>
              <ItemInvSummarize summarizeData={summarizeData.data} />
            </Stack>
          )}
        </Col>
      </Row>
    </div>
  );
};

const Inventory = () => {
  return (
    <>
      <Main />
    </>
  );
};

Inventory.layout = 'Contentlayout';
// PurchaseOrderList.layout = 'Contentlayout';

export default Inventory;
