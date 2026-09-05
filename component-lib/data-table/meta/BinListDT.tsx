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
import { UnitDialog } from '@/component-lib/modal/meta/UnitDialog';
import { ZoneDialog } from '@/component-lib/modal/meta/ZoneDialog';
import { BinDialog } from '@/component-lib/modal/meta/BInDialog';
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

export default function BinListDataTable(props: any) {
  const { data, shelfId } = props;
  const [_open, setOpenModal] = useAtom(openBinModalAtom);
  //
  const [deleteToggle, setDeleteToggle] = useState(false);
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
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setEditItem(row);
                setOpenModal(true);
              }}
            >
              <u>
                <span className="tx-medium tx-15">{row.name}</span>
              </u>
            </div>
          </Stack>
        </div>
      ),
    },
    {
      name: 'Storage Type',
      width: '200px',
      selector: (row: any) => [row.storageType],
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <Stack direction="vertical" gap={1}>
            <div>{row.storageType}</div>
          </Stack>
        </div>
      ),
    },
    {
      name: 'Description',
      width: '300px',
      selector: (row: any) => [row.description],
      sortable: false,
      cell: (row: any, index: number) => <div>{row.description}</div>,
    },

    {
      name: 'Capacity',
      width: '300px',
      selector: (row: any) => [row.capacity],
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <Stack direction="vertical" gap={1}>
            <div>{row.capacity}</div>
          </Stack>
        </div>
      ),
    },

    {
      name: 'Active',
      selector: (row: any) => [row.isActive],
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <div className="wd-40">
            {row.isActive ? (
              <span className="badge bg-warning badge-pill me-1 ">Active</span>
            ) : (
              <span className="badge bg-gray-500 badge-pill me-1 ">
                Inactive
              </span>
            )}
          </div>
        </div>
      ),
    },

    // {
    //   name: 'Op',
    //   width: '100px',
    //   sortable: false,
    //   cell: (row: any) => (
    //     <div className="">
    //       <IconButton color="warning" aria-label="Delete" onClick={() => {}}>
    //         <DeleteForever />
    //       </IconButton>
    //     </div>
    //   ),
    // },
  ];

  return (
    <div>
      <BinDialog
        editingItem={editItem}
        showAddBt={true}
        setEditItem={setEditItem}
        shelfId={shelfId}
      />
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
