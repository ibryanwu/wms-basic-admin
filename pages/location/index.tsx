'use client';
import React, { useEffect, useState } from 'react';
import {
  Button as RButton,
  Card,
  Col,
  Row,
  Form,
  Breadcrumb,
  InputGroup,
  Stack,
} from 'react-bootstrap';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import _ from 'lodash';
import { Controller } from 'react-hook-form';
import Select from 'react-select';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import '@xyflow/react/dist/style.css';
import SelectPro from '../../component-lib/select';
import Datepicker from '../../component-lib/form-ele';

import Seo from '@/shared/layout-components/seo/seo';
import { useMe } from '@/rest/auth';
import { useAtom } from 'jotai';
import { getZonesAndBinItemCountsByWarehouse } from '@/rest/location';
import Flow from './react-flow';
import { useToken } from '@/lib/hooks/use-token';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useGetWarehouse } from '@/rest/inv';
import { searchLocationAtom } from '@/stores/atom';
import ZoneListDataTable from '@/component-lib/data-table/meta/ZoneListDT';
import ShelfListDataTable from '@/component-lib/data-table/meta/ShelfListDT';
import BinListDataTable from '@/component-lib/data-table/meta/BinListDT';
import { getBinsByShelf, getShelvesByZone } from '@/service/location';
import { getStaticTranslations } from '@/lib/i18n';

export async function getStaticProps({ locale }: { locale: string }) {
  return getStaticTranslations(locale, ['common', 'location', 'menu']);
}

const SearchCard = (prop: any) => {
  const { setLocationData } = prop;
  // Values  -------------------------------------------------
  const { hasToken } = useToken();
  const routes = useRouter();
  // Auth ----------------------------------------------------
  useEffect(() => {
    if (!hasToken()) {
      routes.push('/login');
    }
  }, [hasToken()]);
  // Atoms ---------------------------------------------------
  const [search, setSearch] = useAtom(searchLocationAtom);

  // UseState  -----------------------------------------------
  const [warehouseId, setWarehouseId] = useState();

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
    //values: defaultFormDate,
  });
  // Hooks  --------------------------------------------------
  const { data: warehouseData } = useGetWarehouse({ isActive: true });
  const {
    mutate: getLocation,
    data: locationData,
    isLoading: isLoadingLocationData,
    serverError: locationDataError,
  } = getZonesAndBinItemCountsByWarehouse();
  // Use Effect  ---------------------------------------------
  useEffect(() => {
    if (locationData && locationData.code === 0) {
      setLocationData({ data: [...locationData.data], warehouseId });
    }
  }, [locationData]);

  useEffect(() => {
    if (search) {
      if (warehouseId && warehouseId > 0) {
        getLocation({ warehouseId });
        setSearch(false);
      }
    }
  }, [search]);

  // Function ------------------------------------------------
  function onSubmit(data: any) {}

  return (
    <div style={{ zIndex: 99999 }}>
      <Form className="form-horizontal" onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="form-group">
          <Form.Label>Warehouse</Form.Label>
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
              onChangeHandler={(data: any) => {
                getLocation({ warehouseId: data.id });
                setWarehouseId(data.id);
              }}
              //isDisabled={itemListDatas?.length > 0}
            />
          )}
        </Form.Group>
      </Form>
    </div>
  );
};
const Location = () => {
  // Values  -------------------------------------------------
  const { hasToken } = useToken();
  const routes = useRouter();
  // Auth ----------------------------------------------------
  useEffect(() => {
    if (!hasToken()) {
      routes.push('/login');
    }
  }, [hasToken()]);
  // Atoms ---------------------------------------------------

  // UseState  -----------------------------------------------
  const [locationData, setLocationData] = useState<any>();
  const [shelfData, setShelfData] = useState();
  const [binData, setBinData] = useState();
  const [currentZone, setCurrentZone] = useState<{
    id: number;
    name: string;
  }>();
  const [currentShelf, setCurrentShelf] = useState<{
    id: number;
    name: string;
  }>();
  const [currentBin, setCurrentBin] = useState<{
    id: number;
    name: string;
  }>();
  const [currentTab, setCurrentTab] = useState('zone');

  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------

  // Use Effect  ---------------------------------------------
  useEffect(() => {
    if (currentZone?.id) {
      setShelfData(getShelvesByZone(currentZone.id, locationData.data));
    }
  }, [currentZone]);
  useEffect(() => {
    if (currentShelf?.id) {
      setBinData(getBinsByShelf(currentShelf.id, locationData.data));
    }
  }, [currentShelf]);

  useEffect(() => {
    if (locationData?.data) {
      if (currentZone?.id) {
        setShelfData(getShelvesByZone(currentZone.id, locationData.data));
      }
      if (currentShelf?.id) {
        setBinData(getBinsByShelf(currentShelf.id, locationData.data));
      }
    }
  }, [locationData]);

  // Function ------------------------------------------------
  // Component ------------------------------------------------

  return (
    <>
      <div>
        <Seo title={'Location List'} />

        {/* <!-- breadcrumb --> */}
        <div className="breadcrumb-header justify-content-between">
          <div className="left-content">
            <span className="main-content-title mg-b-0 mg-b-lg-1">
              Location
            </span>
          </div>
          <div className="justify-content-center mt-2">
            <Breadcrumb className="breadcrumb">
              <Breadcrumb.Item className="breadcrumb-item tx-15" href="#!">
                Location
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
        <Card
          className="card custom-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '4px', // 圆角
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // 阴影
            overflow: 'hidden', // 防止子元素溢出圆角
            width: '100%',
            minHeight: '80vh',
          }}
        >
          <Card.Body>
            <Row className="row-sm">
              <Col xl={12} md={12}>
                <SearchCard setLocationData={setLocationData} />
              </Col>

              <Col xl={12} md={12}>
                <Tabs
                  activeKey={currentTab}
                  onSelect={(key: any) => setCurrentTab(key)}
                  id="uncontrolled-tab-example"
                  className="mb-3"
                >
                  <Tab
                    eventKey="zone"
                    title={`Zone${
                      !_.isEmpty(currentZone?.name)
                        ? '-' + currentZone?.name
                        : ''
                    }`}
                  >
                    {locationData?.data && (
                      <ZoneListDataTable
                        data={locationData.data}
                        warehouseId={locationData.warehouseId}
                        setCurrentTab={setCurrentTab}
                        setCurrentZone={setCurrentZone}
                        setShelfData={setShelfData}
                      />
                    )}
                  </Tab>
                  <Tab
                    eventKey="shelf"
                    title={`Shelf${
                      !_.isEmpty(currentShelf?.name)
                        ? '-' + currentShelf?.name
                        : ''
                    }`}
                  >
                    {currentZone && (
                      <ShelfListDataTable
                        data={shelfData}
                        zoneId={currentZone.id}
                        setCurrentTab={setCurrentTab}
                        setCurrentShelf={setCurrentShelf}
                        setBinData={setBinData}
                      />
                    )}
                  </Tab>
                  <Tab
                    eventKey="bin"
                    title={`Bin${
                      !_.isEmpty(currentBin?.name) ? '-' + currentBin?.name : ''
                    }`}
                  >
                    {currentShelf && (
                      <BinListDataTable
                        data={binData}
                        shelfId={currentShelf.id}
                        setCurrentTab={setCurrentTab}
                      />
                    )}
                  </Tab>
                </Tabs>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

Location.propTypes = {};
Location.defaultProps = {};
Location.layout = 'Contentlayout';

export default Location;
