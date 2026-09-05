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
  InputGroup,
  Button,
} from 'react-bootstrap';
import Link from 'next/link';
import dayjs from 'dayjs';

import { useMe } from '@/rest/auth';
import { useForm, Controller } from 'react-hook-form';

import { storeInfoAtomS, useClearAllAtom } from '@/stores/atom';
import { useGetWarehouse } from '@/rest/inv';
import { useGetAllItems } from '@/rest/items';
import InvReportByItemDt from '@/component-lib/data-table/InvReportByItemDt';
import { useSearchInventories } from '@/rest/inventory';
import { useGetAllVendors } from '@/rest/vendor';
import { parseLocationCode } from '@/service/location';
import { useGetZonesByWarehouse } from '@/rest/location';
import { toast } from 'react-toastify';
import { toastOptions } from '@/utils/public';
import { useAtom } from 'jotai';
import { exportInventoryDetailToCSV } from '@/service/report';
import { customFilterForSelect } from '@/service/items';
import { getStaticTranslations } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';
export async function getStaticProps({ locale }: { locale: string }) {
  return getStaticTranslations(locale, ['common', 'inventory_detail', 'menu']);
}
const Main = () => {
  // Values  -------------------------------------------------
  const searchStartDay = dayjs().subtract(2, 'month').startOf('month').toDate();
  const searchEndDay = dayjs().toDate();

  const defaultSearchData = {
    search: '',
    startExpiryDate: undefined,
    endExpiryDate: undefined,
    item: {},
    vendor: {},
    warehouse: {},
    batchNumber: '',
    orderNo: '',
    remark: '',
    locationCode: '',
  };
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [storeInfo] = useAtom(storeInfoAtomS);

  // UseState  -----------------------------------------------
  const [inventoriesData, setInventoriesData] = useState<any>();
  const [warehouseId, setWarehouseId] = useState<number>();
  const [enableLocationCode, setEnableLocationCode] = useState(false);

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
  const { t } = useTranslation('inventory_detail'); // 加载 xxx.json 翻译文件
  const clearAllAtom = useClearAllAtom();
  const { data: warehouseData } = useGetWarehouse({ isActive: true });
  const { data: vendorsData } = useGetAllVendors({ type: 1 });
  const {
    mutate: getLocation,
    data: locationData,
    isLoading: isLoadingLocationData,
    serverError: locationDataError,
  } = useGetZonesByWarehouse();
  const {
    mutate: searchMutate,
    data: inventoriesRes,
    isLoading,
    serverError,
    setServerError,
  } = useSearchInventories();
  const {
    mutate: getItemOptions,
    options: allItemsOptions,
    isLoading: isLoadingAllItemsOptions,
    serverError: allItemsOptionsDataError,
  } = useGetAllItems();

  // Use Effect  ---------------------------------------------

  useEffect(() => {
    clearAllAtom();
    const payload: any = {
      search: '',
      endDate: dayjs().format('YYYY-MM-DD'),
    };
    searchMutate({ params: { page: 1, pageSize: 200 }, payload });
    getItemOptions({ isActive: true });
  }, []);

  useEffect(() => {
    if (warehouseId && warehouseId > 0) {
      getLocation({ warehouseId });
      setEnableLocationCode(true);
      setValue('locationCode', '');
    }
  }, [warehouseId]);

  useEffect(() => {
    if (inventoriesRes?.data) {
      setInventoriesData(inventoriesRes.data);
    }
  }, [inventoriesRes]);

  // Function ------------------------------------------------
  function handleLocationsCode(locationCode: string) {
    if (warehouseId && warehouseId > 0) {
      const options = parseLocationCode(
        locationCode,
        locationData?.data,
        storeInfo,
        warehouseId,
      );
      return options;
    }
  }
  const exportToCSV = () => {
    const tableHeader = 'SKU,Item Name,Category,Inv Balance,Avg Cost,Inv Total';

    if (inventoriesData?.data) {
      const csv = `${tableHeader}\n${inventoriesData.data
        .map((row: any) => {
          const field: any[] = [];
          //field.push(convertPurOrderSeqNo(row.seq_order_no));
          field.push(row.items_sku);
          field.push(row.items_name_localizations.en);
          field.push(row.category_name);
          field.push(`${row.inv_balance}/${row.pur_unit_name}`);
          field.push(row.avg_cost_price);
          field.push(`${parseFloat(row.cumulative_sub_total).toFixed(2)}`);

          return field;
        })
        .join('\n')}`;

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  //自定义查询  返回boolean类型
  //searchFields.some(...) 用于检查 searchFields 数组中是否有至少一个字段（field）包含 inputValue
  const customFilter = (option: any, inputValue: any) => {
    return customFilterForSelect(option, inputValue);
  };

  const resetSearch = () => {
    reset(defaultSearchData);
  };
  function onSubmit(data: any) {
    if (!data) return;
    const payload: any = {
      search: data.search,
      batchNumber: data.batchNumber || '',
      remark: data.remark || '',
      itemId: data.item ? data.item.value : '',
      vendorId: data.vendor ? data.vendor.value : '',
      warehouseId: data.warehouse ? data.warehouse.value : '',
    };

    if (data.startExpiryDate)
      payload.startExpiryDate = dayjs(data.startExpiryDate).format(
        'YYYY-MM-DD',
      );

    if (data.startExpiryDate)
      payload.endExpiryDate = dayjs(data.endExpiryDate).format('YYYY-MM-DD');

    if (data.locationCode) {
      const location = handleLocationsCode(data.locationCode);
      if (!location?.zone) {
        toast.warning(t('toast_location_code'), toastOptions);
      }
      payload.location = location;
    } else {
      payload.location = {};
    }
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
                      md={2}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 199 }}
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
                            onChangeHandler={(val: any) => {
                              setWarehouseId(val.value);
                            }}
                            //isDisabled={itemListDatas?.length > 0}
                          />
                        )}
                      </Form.Group>
                    </Col>{' '}
                    <Col
                      md={2}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 197 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_location_code')}</Form.Label>
                        <Form.Control
                          {...register('locationCode')}
                          placeholder="locationCode"
                          type="text"
                          disabled={!enableLocationCode}
                        />
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
                    <Col
                      xs={12}
                      lg={2}
                      xl={2}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 99 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_start_expiry_date')}</Form.Label>
                        <InputGroup className="input-group reactdate-pic">
                          <InputGroup.Text className="input-group-text">
                            <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                          </InputGroup.Text>
                          <div className="wd-150">
                            <Datepicker
                              key="startExpiryDate"
                              name="startExpiryDate"
                              control={control}
                              isMulti={false}
                              rules={{ required: false }}
                            />
                          </div>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col
                      xs={12}
                      lg={2}
                      xl={2}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 99 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_end_expiry_date')}</Form.Label>
                        <InputGroup className="input-group reactdate-pic">
                          <InputGroup.Text className="input-group-text">
                            <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                          </InputGroup.Text>
                          <div className="wd-150">
                            <Datepicker
                              key="endExpiryDate"
                              name="endExpiryDate"
                              control={control}
                              isMulti={false}
                              rules={{ required: false }}
                            />
                          </div>
                        </InputGroup>
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
        {inventoriesData?.data && (
          <Col md={12}>
            <Row className=" row-sm">
              {/* <!-- /col --> */}
              <Col lg={12}>
                <Stack direction="horizontal" gap={3} className="mg-b-10">
                  <Button
                    variant="primary"
                    onClick={() => {
                      exportInventoryDetailToCSV(inventoriesData?.data);
                    }}
                  >
                    <i className="fa fa-table mg-r-4"></i>
                    {t0('btn_export')}
                  </Button>
                </Stack>
              </Col>
            </Row>
          </Col>
        )}

        <Col md={12}>
          <InvReportByItemDt
            inventoriesData={inventoriesData}
          ></InvReportByItemDt>
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
