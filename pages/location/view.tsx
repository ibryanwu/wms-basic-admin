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

import '@xyflow/react/dist/style.css';
import SelectPro from '../../component-lib/select';

import Seo from '@/shared/layout-components/seo/seo';
import { useMe } from '@/rest/auth';
import { useAtom } from 'jotai';
import { useGetZonesByWarehouse } from '@/rest/location';
import Flow from './react-flow';
import { useToken } from '@/lib/hooks/use-token';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useGetWarehouse } from '@/rest/inv';
import { searchLocationAtom } from '@/stores/atom';
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
  const [editItem, setEditItem] = useState(undefined);
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
  } = useGetZonesByWarehouse();
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
    <>
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
    </>
  );
};
const Location = () => {
  // Values  -------------------------------------------------

  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  // UseState  -----------------------------------------------
  const [locationData, setLocationData] = useState();

  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------
  const { mutate: getMe, data: me } = useMe();

  // Use Effect  ---------------------------------------------
  useEffect(() => {
    getMe();
  }, []);

  // Function ------------------------------------------------
  // Component ------------------------------------------------

  return (
    <>
      {me?.role && me.role === 'ADMIN' ? (
        <div>
          <Seo title={'BatchList'} />

          {/* <!-- breadcrumb --> */}
          {/* <div className="breadcrumb-header justify-content-between">
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
          </div> */}
          {/* <!-- /breadcrumb --> */}

          {/* <!-- row --> */}
          <Row className="row-sm">
            <Col xl={12} md={12}>
              <SearchCard setLocationData={setLocationData} />
            </Col>

            <Col xl={12} md={12}>
              {locationData && <Flow locationData={locationData} />}
            </Col>
          </Row>
        </div>
      ) : (
        'Unauthorized'
      )}
    </>
  );
};

Location.propTypes = {};
Location.defaultProps = {};
Location.layout = 'Contentlayout';

export default Location;
