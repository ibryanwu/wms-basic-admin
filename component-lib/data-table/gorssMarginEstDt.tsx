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

export default function GorssMarginEstDt(props: any) {
  const { grossMarginEst } = props;

  const routes = useRouter();
  const [_edit, setEditItem] = useAtom(editItemAtom);
  const [_, setDeleteOrderId] = useAtom(deleteOrderIdAtom);
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
            <span>Batch#</span>
            <span>批次</span>
          </Row>
        </Stack>
      ),
      width: '80px',
      selector: (row: any) => [row.batch_number],
      sortable: false,
      cell: (row: any, index: number) => (
        <span className="tx-20 ">#{row.batch_number}</span>
      ),
    },
    {
      name: (
        <Stack className="pt-2 ">
          <Row className="d-flex flex-row justify-content-center">
            <span>Purchase Total</span>
            <span>进货总成本</span>
          </Row>
        </Stack>
      ),
      width: '200px',
      selector: (row: any) => [row.total_amount],
      sortable: false,
      cell: (row: any, index: number) => (
        <Stack>
          <Col className="d-flex flex-row align-items-center">
            <div className="wd-100p">
              <Row className="d-flex wd-100p flex-row justify-content-end align-items-end">
                <span className="tx-20 tx-semibold">
                  {convertPrice(row.total_amount)}
                </span>
              </Row>
              <Row className="d-flex wd-100p flex-row justify-content-end align-items-end">
                <span className="tx-medium">
                  <span className="tx-gray-600">Items:</span>
                  {row.pur_item_count}
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
            <span>Purchase Total Detail</span>
            <span>进货总成本构成</span>
          </Row>
        </Stack>
      ),
      width: '300px',
      selector: (row: any) => [row.total_amount],
      sortable: false,
      cell: (row: any, index: number) => (
        <Stack>
          <Row className="d-flex wd-100p flex-row justify-content-end align-items-end">
            <span className="tx-medium">
              <span className="tx-gray-600">进货成本小计{`(不含赠品)`}: </span>
              {row.pur_subtotal}
            </span>
          </Row>
          <Row className="d-flex wd-100p flex-row justify-content-end align-items-end">
            <span className="tx-medium">
              <span className="tx-gray-600">进货成本小计{`(含赠品)`}:</span>{' '}
              {row.subtotal_total}
            </span>
          </Row>
          <Row className="d-flex wd-100p flex-row justify-content-end align-items-end border-top mg-t-3">
            <span className="tx-medium">
              <span className="tx-gray-600">折扣金额:</span>{' '}
              {row.discount_amount}
            </span>
          </Row>
          <Row className="d-flex wd-100p flex-row justify-content-end align-items-end">
            <span className="tx-medium">
              <span className="tx-gray-600">总税:</span> {row.tax_amount}
            </span>
          </Row>
        </Stack>
      ),
    },
    {
      name: (
        <Stack className="pt-2">
          <Row className="d-flex flex-row justify-content-center">
            <span>Promotional</span>
            <span>赠品</span>
          </Row>
        </Stack>
      ),
      width: '250px',
      selector: (row: any) => [row.total_amount],
      sortable: false,
      cell: (row: any, index: number) => (
        <Col className="d-flex  flex-row justify-content-end align-items-end">
          <Stack>
            <Row className="d-flex wd-100p flex-row justify-content-end align-items-end">
              <span className="tx-medium">
                <span className="tx-gray-600">赠品数量:</span>{' '}
                {row.promotional_item_count}
              </span>
            </Row>
            <Row className="d-flex wd-100p flex-row justify-content-end align-items-end">
              <span className="tx-medium">
                <span className="tx-gray-600">赠品价值:{`(估价)`}:</span>{' '}
                {row.promotional_subtotal}
              </span>
            </Row>
          </Stack>
        </Col>
      ),
    },

    {
      name: (
        <Stack className="pt-2">
          <Row className="d-flex flex-row justify-content-center">
            <span>Sale Predict</span>
            <span>销售预测</span>
          </Row>
        </Stack>
      ),
      width: '500px',
      selector: (row: any) => [row.total_amount],
      sortable: false,
      cell: (row: any, index: number) => (
        <Row className="wd-100p">
          <Col
            lg={4}
            className="d-flex  flex-row justify-content-end align-items-end"
          >
            <Stack>
              <Row className="d-flex  flex-row justify-content-center align-items-center">
                <div className="tx-medium">
                  <span className="tx-gray-600">预测销售额</span>
                </div>
              </Row>
              <Row className="d-flex  flex-row justify-content-center align-items-center">
                <span className="tx-20">{convertPrice(row.sale_est)}</span>
              </Row>
            </Stack>
          </Col>
          <Col
            lg={4}
            className="d-flex  flex-row justify-content-end align-items-end"
          >
            <Stack>
              <Row className="d-flex  flex-row justify-content-center align-items-center">
                <div className="tx-medium">
                  <span className="tx-gray-600">毛利</span>
                </div>
              </Row>
              <Row className="d-flex  flex-row justify-content-center align-items-center">
                <span className="tx-20">{convertPrice(row.gross_margin)}</span>
              </Row>
            </Stack>
          </Col>
          <Col
            lg={4}
            className="d-flex  flex-row justify-content-end align-items-end"
          >
            <Stack>
              <Row className="d-flex  flex-row justify-content-center align-items-center">
                <div className="tx-medium">
                  <span className="tx-gray-600">毛利率</span>
                </div>
              </Row>
              <Row className="d-flex  flex-row justify-content-center align-items-center">
                <span className="tx-20">
                  {parseFloat(row.gross_margin_ratio).toFixed(2)}%
                </span>
              </Row>
            </Stack>
          </Col>
        </Row>
      ),
    },

    {
      name: 'Detail 明细',
      //width: '8%',
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <IconButton
            color="primary"
            aria-label="list"
            onClick={() => {
              //setEditRowId(row.id);
            }}
          >
            <EditNote />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <span className="datatable">
      {grossMarginEst?.data && (
        <DataTable
          title=""
          //@ts-ignore
          columns={columnsItemList}
          data={grossMarginEst.data}
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
