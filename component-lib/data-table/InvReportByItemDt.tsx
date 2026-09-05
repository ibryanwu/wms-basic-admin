import { Button, Divider, Popover, IconButton } from '@mui/material';
import { EditNote, DeleteForever, TrendingUp } from '@mui/icons-material';
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

export default function InvReportByItemDt(props: any) {
  const { t } = useTranslation('inventory_detail'); // 加载 xxx.json 翻译文件
  const { inventoriesData } = props;
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
      width: '260px',
      selector: (row: any) => [row.sku],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <Stack>
              <span className="mg-l-4 mg-r-4 tx-14">
                {row.item.name_localizations.en}
              </span>
              <span className="mg-l-4 mg-r-4 tx-14">{row.item.sku}</span>
              <span className="mg-l-4 mg-r-4 tx-14">{row.item.spec}</span>
              <span className="mg-l-4 mg-r-4 tx-14">{row.item.remarks}</span>
            </Stack>
          </Stack>
        </div>
      ),
    },

    {
      name: t('dtlb_inv_balance'),
      width: '200px',
      selector: (row: any) => [row.moving_avg_cost],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <span className={` tx-14 `}>
              <span
                className={`${
                  parseFloat(row.balance_quantity) > 0
                    ? 'tx-20 text-primary'
                    : 'tx-14'
                }`}
              >
                {parseFloat(row.balance_quantity).toFixed(0)}
              </span>
              /{row.base_unit.name}
            </span>
            {row.locked_quantity > 0 && (
              <span className={` tx-14 `}>
                <span className={`tx-20 text-primary`}>
                  Locked: {Number(row.locked_quantity).toFixed(0)}
                </span>
              </span>
            )}

            <div>Init: {row.base_quantity} </div>
          </Stack>
        </div>
      ),
    },
    {
      name: t('dtlb_info'),
      width: '240px',
      selector: (row: any) => [row.sku],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <Stack>
              {row.expiryDate && (
                <div>
                  <span className="mg-l-4 mg-r-4 tx-12">
                    ExpiryDate: <span className="tx-16">{row.expiryDate}</span>
                  </span>
                </div>
              )}
              {row.batchNumber && (
                <div>
                  <span className="mg-l-4 mg-r-4 tx-12">
                    BatchNumber:{' '}
                    <span className="tx-16">{row.batchNumber}</span>
                  </span>
                </div>
              )}
              {row.vendor && (
                <div>
                  <span className="mg-l-4 mg-r-4 tx-12">
                    Vendor: <span className="tx-12">{row.vendor.name}</span>
                  </span>
                </div>
              )}
            </Stack>
          </Stack>
        </div>
      ),
    },
    {
      name: t('dtlb_location'),
      width: '340px',
      selector: (row: any) => [row.sku],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <Stack>
              <div>
                <span className="mg-l-4 mg-r-4 tx-14">
                  {row.warehouse.name}
                </span>
              </div>
              <div>
                <span className="mg-l-4 mg-r-4 tx-14">
                  {row.warehouse.location}
                </span>
              </div>
              <div>
                <Stack
                  direction="horizontal"
                  gap={1}
                  className="mg-l-4 mg-r-4 tx-12"
                >
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
              </div>
            </Stack>
          </Stack>
        </div>
      ),
    },
    {
      name: t('dtlb_cost'),
      width: '200px',
      selector: (row: any) => [row.inv_balance],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <span className={`mg-l-4 mg-r-4 tx-14 `}>
              UnitCost: ${parseFloat(row.unitCost).toFixed(2)}
            </span>
            <span className={`mg-l-4 mg-r-4 tx-14 `}>
              Total: ${parseFloat(row.totalCost).toFixed(2)}
            </span>
          </Stack>
        </div>
      ),
    },
    {
      name: t('dtlb_cost_balance'),
      width: '140px',
      selector: (row: any) => [row.inv_balance],
      sortable: false,
      cell: (row: any, index: number) => (
        <div className="wd-100p">
          <Stack>
            <div>
              <span className={'tx-20'}>
                ${parseFloat(row.balance_quantity) * parseFloat(row.unitCost)}
              </span>
            </div>
          </Stack>
        </div>
      ),
    },
  ];

  return (
    <span className="datatable">
      {inventoriesData?.data && (
        <DataTable
          title=""
          //@ts-ignore
          columns={columnsItemList}
          data={inventoriesData.data}
          fixedHeader
          pagination={true}
          customStyles={customStylesForDataTable}
          //conditionalRowStyles={conditionalRowStyles}
        />
      )}
    </span>
  );
}
