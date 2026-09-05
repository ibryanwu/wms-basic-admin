import { Divider, Popover, IconButton } from '@mui/material';
import {
  EditNote,
  DeleteForever,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useAtom } from 'jotai';

import DataTable from 'react-data-table-component';
import { Button, ButtonGroup, Stack } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useDeletePruchaseOrder } from '@/rest/purchase';
import { pluPurHistoryAtom } from '@/stores/atom';
import dayjs from 'dayjs';
import { convertSalesOrderSeqNo } from '@/service/sales';
import { exportInvTransactionsToCSV } from '@/service/report';
import { useTranslation } from 'react-i18next';
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

export default function InvTranscationsDatatable(props: any) {
  const { t } = useTranslation('transactions'); // 加载 xxx.json 翻译文件
  const { transData } = props;
  const { data } = transData;
  const routes = useRouter();

  //
  const [editRowId, setEditRowId] = useState('');

  //
  const columnsItemList = [
    {
      name: '#',
      width: '50px',
      selector: (row: any) => row.rowNumber,
      cell: (row: any, index: number) => index + 1, // index 从 0 开始，所以加 1
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },

    {
      name: t('dtlb_item'),
      width: '240px',
      selector: (row: any) => [row.moving_avg_cost],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <Stack>
              <span className="mg-l-4 mg-r-4 tx-14">{row.item.sku}</span>
              <span className="mg-l-4 mg-r-4 tx-14">
                {row.item.name_localizations.en}
              </span>
              <span className="mg-l-4 mg-r-4 tx-14">{row.item.spec}</span>
              <span className="mg-l-4 mg-r-4 tx-14">{row.item.remarks}</span>
            </Stack>
          </Stack>
        </div>
      ),
    },

    {
      name: t('dtlb_stock_in_out'),
      width: '140px',
      selector: (row: any) => [row.stockInOut],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            {row.transactionType}
            {row.stockInOut === 'in' ? (
              <div>
                <i className="text-success fa fa-angle-double-right"></i>
                <span className="text-success mg-l-4 mg-r-4 tx-14">
                  {row.stockInOut.toUpperCase()}
                </span>
              </div>
            ) : (
              <div>
                <i className="text-danger fa fa-angle-double-left"></i>
                <span className="text-danger mg-l-4 mg-r-4 tx-14">
                  {row.stockInOut.toUpperCase()}
                </span>
              </div>
            )}{' '}
            <Stack direction="horizontal" gap={1} className=" mg-r-4 tx-16">
              <span
                className="pd-l-4 pd-r-4"
                style={{ backgroundColor: '#FAC0A8' }}
              >
                {row.zone ? row.zone.name : ''}
              </span>
              <span
                className="pd-l-4 pd-r-4"
                style={{ backgroundColor: '#4DA6FF', color: 'white' }}
              >
                {row.shelf ? `${row.shelf.name}` : ''}
              </span>
              <span
                className="pd-l-4 pd-r-4"
                style={{ backgroundColor: '#99CC99', color: 'white' }}
              >
                {row.bin ? `${row.bin.name}` : ''}
              </span>
            </Stack>
          </Stack>
        </div>
      ),
    },

    {
      name: t('dtlb_qty'),
      width: '340px',
      selector: (row: any) => [row.moving_avg_cost],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <div>
              <span className="mg-l-4 mg-r-4 tx-14">
                {row.stockInOut === 'in' ? (
                  <span className="text-success">
                    <TrendingUp />
                  </span>
                ) : (
                  <span className="text-danger">
                    <TrendingDown />
                  </span>
                )}
              </span>
              <span
                className={`mg-l-4 mg-r-4 tx-14 ${
                  row.stockInOut === 'in' ? 'text-success' : 'text-danger'
                }`}
              >
                {row.quantityChange}
                {'('}
                {row.base_unit.name}
                {')'}
              </span>
            </div>
            {row.exchangeRate && parseFloat(row.exchangeRate) !== 1 && (
              <div>
                <span
                  className={`mg-l-4 mg-r-4 tx-14 ${
                    row.stockInOut === 'in' ? 'text-success' : 'text-danger'
                  }`}
                >
                  {`(`}
                  {parseFloat(row.quantityChange) *
                    parseFloat(row.exchangeRate)}
                  /{row.case_unit.name} {`)`}
                </span>
              </div>
            )}
            <div className="mg-l-4 mg-r-4 tx-14">
              <span>Init: {row.initQuantity} </span>
              <span>Updated: {row.updatedQuantity}</span>
            </div>
            <span>{row.remarks}</span>
          </Stack>
        </div>
      ),
    },
    {
      name: t('dtlb_warehouse'),
      width: '200px',
      selector: (row: any) => [row.moving_avg_cost],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <div></div>
            <div>
              <span className="mg-l-4 mg-r-4 tx-12">{row.warehouse.name}</span>
            </div>
          </Stack>
        </div>
      ),
    },

    {
      name: t('dtlb_to'),
      width: '240px',
      selector: (row: any) => [row.moving_avg_cost],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <div>
              <span className="mg-l-4 mg-r-4 tx-14">
                {row.vendor ? row.vendor.name : 'other'}
              </span>
            </div>
          </Stack>
        </div>
      ),
    },
    {
      name: t('dtlb_info'),
      width: '240px',
      selector: (row: any) => [row.id],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <span className="mg-l-4 tx-info mg-r-4 tx-14">
              Order#:
              {row.stockInOut === 'in'
                ? row.inboundOrderHeader.order_no ||
                  row.transferOrderHeader.order_no
                : row.outboundOrderHeader.order_no ||
                  row.transferOrderHeader.order_no}
            </span>
            <span className="mg-l-4 mg-r-4 tx-14">
              Order Date:
              {row.stockInOut === 'in'
                ? row.inboundOrderHeader.inbound_date ||
                  row.transferOrderHeader.transfer_date
                : row.outboundOrderHeader.outbound_date ||
                  row.transferOrderHeader.transfer_date}
            </span>
          </Stack>
        </div>
      ),
    },

    // {
    //   name: 'Audit',
    //   width: '240px',
    //   selector: (row: any) => [row.moving_avg_cost],
    //   sortable: false,
    //   cell: (row: any, index: number) => (
    //     <div className="wd-100p">
    //       <Stack>
    //         <span className="mg-l-4 mg-r-4 tx-14">{row.operator_snapshot}</span>

    //         <span className="mg-l-4 mg-r-4 tx-14">
    //           Approved At: {dayjs(row.createdAt).format('YYYY-MM-DD')}
    //         </span>
    //         <span className="mg-l-4 mg-r-4 tx-14">
    //           #:{convertSalesOrderSeqNo(row.seq_order_no)} Invoice No:{' '}
    //           {row.invoice_no}
    //         </span>
    //       </Stack>
    //     </div>
    //   ),
    // },
  ];

  return (
    <>
      <span className="datatable">
        {transData?.data && (
          <DataTable
            title=""
            //@ts-ignore
            columns={columnsItemList}
            data={data}
            fixedHeader
            pagination={true}
            customStyles={customStylesForDataTable}
          />
        )}
      </span>
    </>
  );
}
