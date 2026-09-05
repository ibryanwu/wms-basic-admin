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
  Button,
  Stack,
  InputGroup,
} from 'react-bootstrap';
import Link from 'next/link';
import dayjs from 'dayjs';

import { useMe } from '@/rest/auth';
import { useForm, Controller } from 'react-hook-form';

import { storeInfoAtomS, useClearAllAtom } from '@/stores/atom';
import { useAtom } from 'jotai';
import { toast } from 'react-toastify';
import GrossProfitAnalysis from '@/component-lib/data-table/GrossProfitAnalysis';
import PluHistory from '@/component-lib/data-table/PluHistoryDT';
import { useGetWarehouse, useSearchInventoryTransactions } from '@/rest/inv';
import { useGetAllItems } from '@/rest/items';
import { useGetAllVendors } from '@/rest/vendor';
import InvTranscationsDatatable from '@/component-lib/data-table/InvTranscationsDt';
import { allOrderTypeOptions, parseLocationCode } from '@/service/location';
import { useGetZonesByWarehouse } from '@/rest/location';
import { toastOptions } from '@/utils/public';
import { exportInvTransactionsToCSV } from '@/service/report';
import { customFilterForSelect } from '@/service/items';
import { getStaticTranslations } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';
export async function getStaticProps({ locale }: { locale: string }) {
  return getStaticTranslations(locale, ['common', 'transactions', 'menu']);
}
const Main = () => {
  // Values  -------------------------------------------------
  const searchStartDay = dayjs().subtract(2, 'month').startOf('month').toDate();
  const searchEndDay = dayjs().add(1, 'day').toDate();
  const defaultSearchData = {
    startDate: searchStartDay,
    endDate: searchEndDay,
    item: {},
    vendor: {},
    warehouse: {},
    batchNumber: '',
    locationCode: '',
    orderType: {},
    stockInOut: {},
    orderNo: '',
  };
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [storeInfo] = useAtom(storeInfoAtomS);
  // UseState  -----------------------------------------------
  const [transactionsData, setTransactionsData] = useState();
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
  const { t } = useTranslation('transactions'); // 加载 xxx.json 翻译文件
  const clearAllAtom = useClearAllAtom();
  const { data: vendorsData } = useGetAllVendors({ type: 3, isActive: true });
  const { data: warehouseData } = useGetWarehouse({ isActive: true });

  const {
    mutate: searchMutate,
    data: transData,
    isLoading,
    serverError,
    setServerError,
  } = useSearchInventoryTransactions();

  const {
    mutate: getItemOptions,
    options: allItemsOptions,
    isLoading: isLoadingAllItemsOptions,
    serverError: allItemsOptionsDataError,
  } = useGetAllItems();

  const {
    mutate: getLocation,
    data: locationData,
    isLoading: isLoadingLocationData,
    serverError: locationDataError,
  } = useGetZonesByWarehouse();

  // Use Effect  ---------------------------------------------

  useEffect(() => {
    clearAllAtom();
    //
    searchMutate({
      params: { page: 1, pageSize: 200 },
      payload: { location: {} },
    });
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
    if (transData && transData.code === 0) {
      setTransactionsData(transData.data);
    }
  }, [transData]);

  // Function ------------------------------------------------
  const resetSearch = () => {
    reset(defaultSearchData);
  };

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

  //自定义查询  返回boolean类型
  //searchFields.some(...) 用于检查 searchFields 数组中是否有至少一个字段（field）包含 inputValue
  const customFilter = (option: any, inputValue: any) => {
    return customFilterForSelect(option, inputValue, true);
  };

  function onSubmit(data: any) {
    if (!data) return;
    const payload: any = {};

    if (data.item) {
      payload.itemId = data.item.value;
    }
    if (data.vendor) {
      payload.vendorId = data.vendor.value;
    }
    if (data.warehous) {
      payload.warehouseId = data.warehouse.value;
    }
    if (data.orderType) {
      payload.orderType = data.orderType.value;
    }
    if (data.stockInOut) {
      payload.stockInOut = data.stockInOut.value;
    }

    if (data.orderNo) {
      payload.orderNo = data.orderNo;
    }
    if (data.batchNumber) {
      payload.batchNumber = data.batchNumber;
    }

    if (data.startDate) {
      payload.startDate = data.startDate;
      data.endDate
        ? (payload.endDate = new Date(data.endDate))
        : (payload.endDate = new Date());
    }
    if (data.locationCode) {
      const location = handleLocationsCode(data.locationCode);
      if (!location?.zone) {
        toast.warning(t('toast_location_code'), toastOptions);
      }
      payload.location = location;
    } else {
      payload.location = {};
    }
    searchMutate({ params: { page: 1, pageSize: 400 }, payload });
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
                      md={2}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 197 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_batch_number')}</Form.Label>
                        <Form.Control
                          {...register('batchNumber')}
                          placeholder="batchNumber"
                          type="text"
                        />
                      </Form.Group>
                    </Col>
                    <Col
                      md={2}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 197 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label> {t('lb_order_no')}</Form.Label>
                        <Form.Control
                          {...register('orderNo')}
                          placeholder="orderNo"
                          type="text"
                        />
                      </Form.Group>
                    </Col>
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
                      style={{ zIndex: 197 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_order_type')}</Form.Label>
                        <SelectPro
                          key="orderType"
                          name="orderType"
                          control={control}
                          defaultValue={undefined}
                          options={allOrderTypeOptions}
                          isMulti={false}
                          rules={{}}
                          filterOption={undefined}
                          isDisabled={false}
                          onChangeHandler={undefined}
                          //isDisabled={itemListDatas?.length > 0}
                        />
                      </Form.Group>
                    </Col>
                    <Col
                      md={2}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 197 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_stock_in_out')}</Form.Label>
                        <SelectPro
                          key="stockInOut"
                          name="stockInOut"
                          control={control}
                          defaultValue={undefined}
                          options={[
                            { value: 'in', label: 'IN' },
                            { value: 'out', label: 'OUT' },
                          ]}
                          isMulti={false}
                          rules={{ required: 'stockInOut is required' }}
                          filterOption={undefined}
                          isDisabled={false}
                          onChangeHandler={undefined}
                          //isDisabled={itemListDatas?.length > 0}
                        />
                      </Form.Group>
                    </Col>

                    <Col
                      xs={12}
                      lg={2}
                      className=" mg-t-10 mg-md-t-0 "
                      style={{ zIndex: 99 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_order_start_date')}</Form.Label>
                        <InputGroup className="input-group reactdate-pic">
                          <InputGroup.Text className="input-group-text">
                            <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                          </InputGroup.Text>
                          <div className="wd-150">
                            <Datepicker
                              key="startDate"
                              name="startDate"
                              control={control}
                              isMulti={false}
                              rules={{}}
                            />
                          </div>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col
                      xs={12}
                      lg={2}
                      className=" mg-t-10 mg-md-t-0 "
                      style={{ zIndex: 99 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>{t('lb_order_end_date')}</Form.Label>
                        <InputGroup className="input-group reactdate-pic">
                          <InputGroup.Text className="input-group-text">
                            <i className="typcn typcn-calendar-outline tx-24 lh--9 op-6"></i>
                          </InputGroup.Text>
                          <div className="wd-150">
                            <Datepicker
                              key="endDate"
                              name="endDate"
                              control={control}
                              isMulti={false}
                              rules={{}}
                            />
                          </div>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={4} className=" mg-t-10 mg-md-t-0">
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
      <Row>
        <Col md={12}>
          {transactionsData && (
            <>
              <Button
                variant=""
                onClick={() => {
                  exportInvTransactionsToCSV(transactionsData);
                }}
                className="btn mg-b-6 me-2 btn-primary"
              >
                {t0('btn_export')}
              </Button>
              <InvTranscationsDatatable transData={transactionsData} />
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

const InvTransactions = () => {
  return (
    <>
      <Main />
    </>
  );
};

InvTransactions.layout = 'Contentlayout';
// PurchaseOrderList.layout = 'Contentlayout';

export default InvTransactions;
