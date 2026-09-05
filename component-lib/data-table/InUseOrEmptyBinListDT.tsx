import { Button, Divider, IconButton } from '@mui/material';
import { EditNote, DeleteForever } from '@mui/icons-material';
import { useAtom } from 'jotai';
import {
  editItemAtom,
  itemListAtom,
  openBinModalAtom,
  openInUseOrEmptyBinListDrawerAtom,
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

export default function InUseOrEmptyBinListTable(props: any) {
  const { data, shelfId } = props;
  const [_open, setOpenInUseOrEmptyBinListDrawer] = useAtom(
    openInUseOrEmptyBinListDrawerAtom,
  );
  //
  const [editItem, setEditItem] = useState(undefined);

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
      name: 'Name',
      width: '140px',
      selector: (row: any) => [row.name],
      sortable: false,
      cell: (row: any, index: number) => (
        <div>
          <Stack direction="vertical" gap={1}>
            <div style={{ cursor: 'pointer' }}>
              <span className="tx-medium tx-15">{row.locationCode}</span>
            </div>
          </Stack>
        </div>
      ),
    },
    // {
    //   name: 'ItemCount',
    //   width: '140px',
    //   selector: (row: any) => [row.name],
    //   sortable: false,
    //   cell: (row: any, index: number) => (
    //     <div>
    //       <Stack direction="vertical" gap={1}>
    //         <div>
    //           <span className="tx-medium tx-15">{row.itemCount}</span>
    //         </div>
    //       </Stack>
    //     </div>
    //   ),
    // },
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
