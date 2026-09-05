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
import { Button, ButtonGroup } from '@mui/joy';
import { Breadcrumb, Col, Row, Form, Card, Stack } from 'react-bootstrap';
import Link from 'next/link';
import dayjs from 'dayjs';

import { useMe } from '@/rest/auth';
import { useForm, Controller } from 'react-hook-form';

import { useClearAllAtom } from '@/stores/atom';
import {
  useGetWarehouse,
  useSearchInventoryTransactions,
  useSearchItemsInventory,
} from '@/rest/inv';
import { useGetAllItems } from '@/rest/items';
import InvTranscationsDatatable from '@/component-lib/data-table/InvTranscationsDt';
import InvReportByItemDt from '@/component-lib/data-table/InvReportByItemDt';
import { customFilterForSelect } from '@/service/items';

const Main = () => {
  // Values  -------------------------------------------------
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------

  // UseState  -----------------------------------------------
  // UseForm  ------------------------------------------------
  const {
    register,
    handleSubmit: handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    control,
  } = useForm({
    mode: 'onTouched',
    reValidateMode: 'onSubmit',
    defaultValues: { search: '' },
  });
  // Hooks  --------------------------------------------------
  const { mutate: getMe, data: me, isLoading: isLoadingMe, isMe } = useMe();
  const clearAllAtom = useClearAllAtom();
  const { data: warehouseData } = useGetWarehouse({ isActive: true });

  const {
    mutate: searchMutate,
    data: invData,
    isLoading,
    serverError,
    setServerError,
  } = useSearchItemsInventory();

  // Use Effect  ---------------------------------------------

  useEffect(() => {
    clearAllAtom();
  }, []);

  // Function ------------------------------------------------
  //自定义查询  返回boolean类型
  //searchFields.some(...) 用于检查 searchFields 数组中是否有至少一个字段（field）包含 inputValue
  const customFilter = (option: any, inputValue: any) => {
    return customFilterForSelect(option, inputValue);
  };

  function onSubmit(data: any) {
    if (!data) return;
    const payload: any = {
      search: data.search,
    };
    searchMutate({ params: { page: 1, pageSize: 200 }, payload });
  }
  return (
    <div>
      <Seo title={'Product Form'} /> {/* <!-- breadcrumb --> */}
      <div className="breadcrumb-header justify-content-between">
        <div className="left-content">
          <span className="main-content-title mg-b-0 mg-b-lg-1">
            Inventory report by Item
          </span>
        </div>

        <div className="justify-content-center mt-2">
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item
              className="breadcrumb-item tx-15"
              href="./index.tsx"
            >
              Inventory
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
                    {/* <Col
                      md={4}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 999 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>Items</Form.Label>
                        {allItemsOptions && (
                          <div>
                            <Controller
                              key="item"
                              name="item"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  className=""
                                  value={field.value}
                                  // rules={{ required: 'Username is required' }}
                                  onChange={(value) => {
                                    console.log(
                                      '🚀 ~ EditPurchaseOrderItemsDrawer ~ value:',
                                      value,
                                    );

                                    field.onChange(value);
                                  }}
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
                    </Col> */}
                    <Col
                      md={4}
                      className=" mg-t-10 mg-md-t-0"
                      style={{ zIndex: 999 }}
                    >
                      <Form.Group className="form-group">
                        <Form.Label>Items</Form.Label>
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

                    <Col md={1} className=" mg-t-10 mg-md-t-0">
                      <Form.Group className="form-group">
                        <Form.Label>
                          <span className="tx-white">.</span>
                        </Form.Label>
                        <Button type="submit" disabled={isLoading}>
                          Search
                        </Button>
                      </Form.Group>
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
          <InvReportByItemDt invData={invData}></InvReportByItemDt>
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
