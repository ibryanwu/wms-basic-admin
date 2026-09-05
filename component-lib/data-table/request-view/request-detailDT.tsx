import { Button, Divider, IconButton } from '@mui/material';
import { EditNote, DeleteForever } from '@mui/icons-material';
import { useAtom } from 'jotai';
import {
  editItemAtom,
  itemListAtom,
  openBinModalAtom,
  openPurItemDrawerAtom,
  openUnitModalAtom,
  openZoneModalAtom,
} from '@/stores/atom';
import DataTable from 'react-data-table-component';
import { Stack } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';

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

const conditionalRowStyles = [];

export default function RequestViewTable(props: any) {
  const { data } = props;
  //

  //

 

  //
  const columnsItemList = [
    {
      name: '#',
      width: '60px',
      selector: (row: any) => row.rowNumber,
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
      name: 'Item',
      width: '200px',
      selector: (row: any) => [row.name],
      sortable: false,
      cell: (row: any, index: number) => (
        <div>
          <Stack direction="vertical" gap={1}>
            <span className="tx-medium tx-12">{row.item.sku}</span>
            <span className="tx-medium tx-12">
              {row.item.name_localizations.en}
            </span>
            <span className="tx-medium tx-12">SPEC:{row.item.spec}</span>
          </Stack>
        </div>
      ),
    },
    {
      name: 'Qty',
      width: '200px',
      selector: (row: any) => [row.storageType],
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <Stack direction="vertical" gap={1}>
            <div>
              {Number(row.qty_base).toFixed(2)} / {row.base_unit.name}
            </div>
            {Number(row.qty_case) > 0 && (
              <div>
                {Number(row.qty_case).toFixed(2)} / {row.case_unit?.name}
              </div>
            )}
          </Stack>
        </div>
      ),
    },
    {
      name: 'Remark',
      selector: (row: any) => [row.storageType],
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <Stack direction="vertical" gap={1}>
            {row.remark}
          </Stack>
        </div>
      ),
    },
  ];

  return (
    <div>
      <span className="datatable">
        {data?.length > 0 && (
          <DataTable
            title=""
            //@ts-ignore
            columns={columnsItemList}
            data={data}
            fixedHeader
            pagination={false}
            customStyles={customStylesForDataTable}
            //conditionalRowStyles={conditionalRowStyles}
          />
        )}
      </span>
    </div>
  );
}
