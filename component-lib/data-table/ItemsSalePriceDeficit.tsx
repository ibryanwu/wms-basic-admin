import { Button, Divider, Popover, IconButton } from '@mui/material';
import { EditNote, DeleteForever, Rocket } from '@mui/icons-material';
import { useAtom } from 'jotai';
import {
  deleteOrderIdAtom,
  editItemAtom,
  itemListAtom,
  openPurItemDrawerAtom,
} from '@/stores/atom';
import DataTable from 'react-data-table-component';
import { Col, Row, Stack } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useDeletePruchaseOrder } from '@/rest/purchase';
import { useMe } from '@/rest/auth';
import { convertPrice } from '@/utils/public';
import dayjs from 'dayjs';
//
const customStylesForDataTable = {
  rows: {
    style: {
      '&:hover': {
        backgroundColor: '#f2f8ff', // 与你的CSS样式相同的颜色
      },
      paddingTop: '5px',
      paddingBottom: '5px',
      maxHeight: '400px', // 设置表格的最大高度
      overflowY: 'auto', // 当内容超出高度时显示垂直滚动条
    },
  },
};

const conditionalRowStyles = [{}];

export default function ItemsSalePriceDeficit(props: any) {
  const { itemsSalePriceDeficit, grossMargin } = props;
  

  const routes = useRouter();
  const [_edit, setEditItem] = useAtom(editItemAtom);
  //
  const [editRowId, setEditRowId] = useState('');
  //

  //
  useEffect(() => {
    if (editRowId !== '') {
      routes.push(`/purchase-order/${editRowId}`);
    }
  }, [editRowId]);

  //
  const columnsItemList = [
    {
      name: (
        <Stack className="pt-2 ">
          <Row className="d-flex flex-row justify-content-center">
            <span>#</span>
          </Row>
        </Stack>
      ),
      width: '80px',
      selector: (row: any) => row.rowNumber,
      sortable: false,
      cell: (row: any, index: number) => {
        return (
          <span>
            {index + 1}
            <span className=" tx-white">
              <br></br>
              {row.sort_index}
            </span>
          </span>
        );

        // return ;
      }, // index 从 0 开始，所以加 1
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: (
        <Stack className="pt-2 ">
          <Row className="d-flex flex-row justify-content-center">
            <span>Item</span>
          </Row>
        </Stack>
      ),
      width: '300px',
      selector: (row: any) => [row.total_amount],
      sortable: false,
      cell: (row: any, index: number) => (
        <Stack>
          <Col className="d-flex flex-row align-items-center">
            <div className="wd-100p">
              <Row className="d-flex wd-100p flex-row justify-content-start align-items-start">
                <span className="tx-12 tx-semibold">{row.barcode}</span>
              </Row>
              <Row className="d-flex wd-100p flex-row justify-content-start align-items-start">
                <span className="tx-medium">
                  {row.name_localizations.en}
                  {row.name_localizations.zh}
                </span>
              </Row>
            </div>
          </Col>
        </Stack>
      ),
    },
    {
      name: (
        <Stack className="pt-2">
          <Row className="d-flex flex-row justify-content-center">
            <span>进货单价</span>
          </Row>
        </Stack>
      ),
      width: '160px',
      selector: (row: any) => [row.total_amount],
      sortable: false,
      cell: (row: any, index: number) => (
        <Row className="d-flex wd-100p flex-row justify-content-end align-items-center">
          <span className="tx-medium">
            {`(${row.base_unit_snapshot})  `}
            <span className="tx-20">{convertPrice(row.price_base)}</span>
          </span>
        </Row>
      ),
    },
    {
      name: (
        <Stack className="pt-2">
          <Row className="d-flex flex-row justify-content-center">
            <span>录单时售价快照</span>
          </Row>
        </Stack>
      ),
      width: '150px',
      selector: (row: any) => [row.sale_price_base_snapshot],
      sortable: false,
      cell: (row: any, index: number) => (
        <Row className="d-flex wd-100p flex-row justify-content-end align-items-center">
          <span className="tx-medium">
            <span className="tx-20">
              {convertPrice(row.sale_price_base_snapshot)}
            </span>
          </span>
        </Row>
      ),
    },

    {
      name: (
        <Stack className="pt-2">
          <Row className="d-flex flex-row justify-content-center">
            <span>Lboss 最新售价</span>
          </Row>
        </Stack>
      ),
      width: '140px',
      selector: (row: any) => [row.total_amount],
      sortable: false,
      cell: (row: any, index: number) => (
        <Stack>
          <Row className="d-flex wd-100p flex-row justify-content-end align-items-center">
            <span className="tx-medium">
              <span className="tx-20">
                {convertPrice(row.lastest_sales_price)}
              </span>
            </span>
          </Row>
          <Row className="d-flex wd-100p flex-row justify-content-end align-items-center">
            <span className="tx-medium">
              <span className="tx-15"></span>
              {dayjs(row.lboss_update_time).format('YYYY-MM-DD')}
            </span>
          </Row>
        </Stack>
      ),
    },
    {
      name: (
        <Stack className="pt-2">
          <Row className="d-flex flex-row justify-content-center">
            <span>建议售价</span>
          </Row>
        </Stack>
      ),
      width: '200px',
      selector: (row: any) => [row.total_amount],
      sortable: false,
      cell: (row: any, index: number) => (
        <Stack>
          <Row className="d-flex wd-100p flex-row justify-content-end align-items-center">
            <span className="tx-medium tx-danger tx-20">
              {convertPrice(
                parseFloat(row.price_base) * grossMargin.grossMargin,
              )}
            </span>
          </Row>
          <Row className="d-flex wd-100p flex-row justify-content-end align-items-center">
            <span className="tx-gray-500">调价建议:</span>

            <span className="tx-medium tx-danger tx-14">
              {convertPrice(
                parseFloat(row.price_base) * grossMargin.grossMargin -
                  parseFloat(row.lastest_sales_price),
              )}
            </span>
          </Row>
        </Stack>
      ),
    },
    {
      name: (
        <Stack className="pt-2">
          <Row className="d-flex flex-row justify-content-center">
            <span>进货单</span>
          </Row>
        </Stack>
      ),
      width: '200px',
      selector: (row: any) => [row.invoice_no],
      sortable: false,
      cell: (row: any, index: number) => (
        <Row className="d-flex wd-100p flex-row justify-content-end align-items-center">
          <span className="tx-medium tx-success tx-20">{row.invoice_no}</span>
        </Row>
      ),
    },
  ];

  return (
    <span className="datatable">
      {itemsSalePriceDeficit?.data && (
        <DataTable
          title=""
          //@ts-ignore
          columns={columnsItemList}
          data={itemsSalePriceDeficit.data}
          fixedHeader
          pagination={true}
          customStyles={customStylesForDataTable}

          //fixedHeaderScrollHeight="300px" // 指定滚动区域高度
          //conditionalRowStyles={conditionalRowStyles}
        />
      )}
    </span>
  );
}
