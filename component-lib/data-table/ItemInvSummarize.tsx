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
import dayjs from 'dayjs';
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

export default function ItemInvSummarize(props: any) {
  const { t } = useTranslation('inventory_warehouse'); // 加载 xxx.json 翻译文件
  const { summarizeData } = props;

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
      name: t('dtlb_sku'),
      width: '300px',
      selector: (row: any) => [row.item_name],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <Stack>
              <span className="mg-l-4 mg-r-4 tx-14">{row.item_name}</span>
            </Stack>
          </Stack>
        </div>
      ),
    },

    {
      name: t('dtlb_warehouse'),
      width: '200px',
      selector: (row: any) => [row.warehouse_name],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <Stack>
              <span className="mg-l-4 mg-r-4 tx-14">{row.warehouse_name}</span>
            </Stack>
          </Stack>
        </div>
      ),
    },

    {
      name: t('dtlb_balance'),
      width: '200px',
      selector: (row: any) => [row.total_balance],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <Stack>
              <span className="mg-l-4 mg-r-4 tx-14">
                {parseFloat(row.total_balance).toFixed(2)}
              </span>
            </Stack>
          </Stack>
        </div>
      ),
    },
    {
      name: t('dtlb_picking'),
      width: '200px',
      selector: (row: any) => [row.total_locked_balance],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <Stack>
              <span className="mg-l-4 mg-r-4 tx-14">
                {row.total_locked_balance}
              </span>
            </Stack>
          </Stack>
        </div>
      ),
    },
    {
      name: t('dtlb_total_cost'),
      width: '200px',
      selector: (row: any) => [row.total_cost],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <Stack>
              <span className="mg-l-4 mg-r-4 tx-14">
                {parseFloat(row.total_cost).toFixed(2)}
              </span>
            </Stack>
          </Stack>
        </div>
      ),
    },
  ];

  return (
    <span className="datatable">
      {summarizeData && (
        <DataTable
          title=""
          //@ts-ignore
          columns={columnsItemList}
          data={summarizeData}
          fixedHeader
          pagination={true}
          customStyles={customStylesForDataTable}
          //conditionalRowStyles={conditionalRowStyles}
        />
      )}
    </span>
  );
}
