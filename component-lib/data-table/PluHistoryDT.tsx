import { Button, Divider, Popover, IconButton } from '@mui/material';
import { EditNote, DeleteForever } from '@mui/icons-material';
import { useAtom } from 'jotai';

import DataTable from 'react-data-table-component';
import { Stack } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import {
  useDeletePruchaseOrder,
  useGetPurchaseHistoryByPlu,
} from '@/rest/purchase';
import { pluPurHistoryAtom } from '@/stores/atom';
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

export default function PluHistory() {
  // Values  -------------------------------------------------
  // Auth ----------------------------------------------------
  const routes = useRouter();
  // Atoms ---------------------------------------------------
  const [plu] = useAtom(pluPurHistoryAtom);
  // UseState  -----------------------------------------------
  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------
  const {
    mutate: getPluHistory,
    data: pluHist,
    isLoading,
  } = useGetPurchaseHistoryByPlu();
  // Use Effect  ---------------------------------------------
  useEffect(() => {
    if (plu && plu.length > 0) {
      getPluHistory({ plu });
    }
  }, [plu]);
  useEffect(() => {
    console.log('🚀 ~ useEffect ~ pluHist:', pluHist);
  }, [pluHist]);
  // Function ------------------------------------------------

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
      width: '180px',
      selector: (row: any) => [row.plu],
      sortable: false,
      cell: (row: any, index: number) => (
        <div style={{ cursor: 'pointer' }}>
          <Stack>
            <span className="mg-l-4 mg-r-4 tx-primary tx-12">{row.plu}</span>
            {row.name_localizations.zh}
            <span className="mg-l-4 mg-r-4  tx-12">
              Batch:{row.batch_number}
            </span>
            <span className="mg-l-4 mg-r-4  tx-12">Inv:{row.invoice_no}</span>

            <span className="mg-l-4 mg-r-4  tx-12">
              {dayjs(row.purchased_date).format('YYYY-MM-DD')}
            </span>
            <span className="mg-l-4 mg-r-4  tx-12">Vendor:{row.name}</span>

            <span className="mg-l-4 mg-r-4  tx-12">Last Modified:</span>
            <span className="mg-l-4 mg-r-4  tx-12">{row.modified_by}</span>
            {row.is_promotional_item && (
              <span className="mg-l-4 mg-r-4  tx-12">
                Promotional:{row.is_promotional_item}
              </span>
            )}
          </Stack>
        </div>
      ),
    },
    {
      name: 'PUR',
      width: '160px',
      selector: (row: any) => [row.qty_pur],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <div className="d-flex ">
              <span className="mg-l-4 mg-r-4 tx-12">
                Unit: {row.pur_unit_snapshot}
              </span>
            </div>
            <div className="d-flex ">
              <span className="mg-l-4 mg-r-4 tx-12">PurQty: {row.qty_pur}</span>
            </div>
            <div className="d-flex bd-b">
              <span className="mg-l-4 mg-r-4 tx-12">
                Price: {row.price_pur}
              </span>
            </div>
            <span className="mg-l-4 mg-r-4 tx-14">
              1 {row.pur_unit_snapshot}={row.exchange_rate}
              {row.base_unit_snapshot}
            </span>
          </Stack>
        </div>
      ),
    },
    {
      name: 'BASE',
      width: '160px',
      selector: (row: any) => [row.qty_base],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <div className="d-flex ">
              <span className="mg-l-4 mg-r-4 tx-12">
                Unit:{row.base_unit_snapshot}
              </span>
            </div>
            <div className="d-flex ">
              <span className="mg-l-4 mg-r-4 tx-12">Qty:{row.qty_base}</span>
            </div>

            <div className="d-flex ">
              <span className="mg-l-4 mg-r-4 tx-16 tx-danger">
                Cost:{row.price_base}
              </span>
            </div>

            <div className="d-flex ">
              <span className="mg-l-4 mg-r-4 tx-12">
                Lboss Sale:{row.sale_price_base_snapshot}
              </span>
            </div>
          </Stack>
        </div>
      ),
    },
  ];

  return (
    <span className="datatable">
      {pluHist?.data && (
        <DataTable
          title=""
          //@ts-ignore
          columns={columnsItemList}
          data={pluHist.data}
          fixedHeader
          pagination={true}
          customStyles={customStylesForDataTable}

          //conditionalRowStyles={conditionalRowStyles}
        />
      )}
    </span>
  );
}
