'use client';
import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Seo from '@/shared/layout-components/seo/seo';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from 'react-table';
import {
  Breadcrumb,
  Col,
  Row,
  Card,
  Button,
  ProgressBar,
  Form,
  Spinner,
  Image,
} from 'react-bootstrap';
import Link from 'next/link';
import Select from 'react-select';
import * as Dashboarddata from '../../component-lib/dashboard';
import {
  COLUMNS,
  DATATABLE,
  GlobalFilter,
} from '@/shared/data/dashboards/dashboards1';
import { useToken } from '@/lib/hooks/use-token';
import { useRouter } from 'next/router';
import { useFetchDayTotalizer, useGetTotalizersView } from '@/rest/report';
import { mobileWidth } from '@/lib/sys';
import dayjs from 'dayjs';

const Main = () => {
  return <>Coming soon</>;
};

const PurchaseOrderList = () => {
  return (
    <>
      <Main></Main>
    </>
  );
};

PurchaseOrderList.layout = 'Contentlayout';
// PurchaseOrderList.layout = 'Contentlayout';

export default PurchaseOrderList;
