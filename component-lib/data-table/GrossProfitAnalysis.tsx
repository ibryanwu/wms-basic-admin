import { Button, Divider, Popover, IconButton } from '@mui/material';
import { EditNote, DeleteForever } from '@mui/icons-material';
import { useAtom } from 'jotai';

import DataTable from 'react-data-table-component';
import { Stack } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useDeletePruchaseOrder } from '@/rest/purchase';
import { pluPurHistoryAtom } from '@/stores/atom';
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

export default function GrossProfitAnalysis(props: any) {
  const { analysisData } = props;
  const [pluId, setPluId] = useAtom(pluPurHistoryAtom);
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
      name: 'PLU',
      width: '200px',
      selector: (row: any) => [row.plu],
      sortable: false,
      cell: (row: any, index: number) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setPluId(row.plu);
          }}
        >
          <Stack>
            <span className="mg-l-4 mg-r-4 tx-primary tx-12">{row.plu}</span>
            <span className="mg-l-4 mg-r-4  tx-12">{row.name_en}</span>
            <span className="mg-l-4 mg-r-4  tx-12">
              {row.name_zh}
              {row.description}
            </span>
          </Stack>
        </div>
      ),
    },
    {
      name: 'Sale Amount',
      width: '220px',
      selector: (row: any) => [row.sale_amount],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <div className="d-flex flex-row-reverse bd-d">
              <span className="mg-l-4 mg-r-4 tx-14">
                Amount: {row.sale_amount}
              </span>
            </div>
            <div className="d-flex flex-row-reverse bd-d ">
              <>
                <span className="mg-l-2 mg-r-2 tx-12">
                  Unit: {row.sale_unit}
                </span>{' '}
                <span className="mg-l-2 mg-r-2 tx-12">
                  Weight: {row.sale_weight}
                </span>
              </>
            </div>
            <div className="d-flex flex-row-reverse bd-d ">
              <span className="mg-l-2 mg-r-2 tx-14 tx-info">
                RealCost: {row.sale_unit_cost}
              </span>{' '}
            </div>
          </Stack>
        </div>
      ),
    },

    {
      name: 'MovingAvgCost',
      width: '180px',
      selector: (row: any) => [row.moving_avg_cost],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <div className="d-flex flex-row-reverse">
              <span className="mg-l-4 mg-r-4 tx-14">{row.moving_avg_cost}</span>
            </div>
            <div className="d-flex flex-row-reverse">
              <span className="mg-l-4 mg-r-4 tx-12">
                Lboss: {row.lastest_sales_price}
              </span>
            </div>

            {parseFloat(row.moving_avg_cost) * 1.38 >
              parseFloat(row.lastest_sales_price) && (
              <div className="d-flex flex-row-reverse">
                <mark>
                  Rec.
                  <span className="mg-l-4 mg-r-4 tx-16">
                    {(parseFloat(row.moving_avg_cost) * 1.38).toFixed(2)}
                  </span>
                </mark>
              </div>
            )}
          </Stack>
        </div>
      ),
    },

    {
      name: 'GrossProfitRatio',
      width: '180px',
      selector: (row: any) => [row.gross_profit_ratio],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <div className="d-flex flex-row-reverse">
              <span className="mg-l-4 mg-r-4 tx-14 tx-danger">
                RealPR: {row.gross_profit_ratio}
              </span>
            </div>
            <div className="d-flex flex-row-reverse">
              <span className="mg-l-4 mg-r-4 tx-14">
                LbossPR:
                {(
                  (row.lastest_sales_price - row.sale_unit_cost) /
                  row.sale_unit_cost
                ).toFixed(2)}
              </span>
            </div>
          </Stack>
        </div>
      ),
    },
  ];

  return (
    <span className="datatable">
      {analysisData?.data && (
        <DataTable
          title=""
          //@ts-ignore
          columns={columnsItemList}
          data={analysisData.data}
          fixedHeader
          pagination={true}
          customStyles={customStylesForDataTable}
          //conditionalRowStyles={conditionalRowStyles}
        />
      )}
    </span>
  );
}
