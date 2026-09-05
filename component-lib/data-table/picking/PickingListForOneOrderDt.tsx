import { Button, Divider, Popover, IconButton } from '@mui/material';
import { EditNote, DeleteForever } from '@mui/icons-material';
import { useAtom } from 'jotai';
import {
  deleteOrderIdAtom,
  editItemAtom,
  itemListAtom,
  openPurItemDrawerAtom,
} from '@/stores/atom';
import DataTable from 'react-data-table-component';
import { Stack } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useFinishOrder } from '@/rest/outbound';

//
const customStylesForDataTable = {
  rows: {
    style: {
      // '&:hover': {
      //   backgroundColor: '#f2f8ff', // 与你的CSS样式相同的颜色
      // },
      paddingTop: '5px',
      paddingBottom: '5px',
      maxHeight: '400px', // 设置表格的最大高度
      overflowY: 'auto', // 当内容超出高度时显示垂直滚动条
    },
  },
};

export default function PickingListForOneOrder(props: any) {
  const { data, setPickedItem, setCurrentItem } = props;
  // Values  -------------------------------------------------

  // Auth ----------------------------------------------------

  // Atoms ---------------------------------------------------
  // UseState  -----------------------------------------------
  const [selectedLockId, setSelectedLockId] = useState<string>();

  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------

  // Use Effect  ---------------------------------------------
  // Function ------------------------------------------------

  const routes = useRouter();

  const conditionalRowStyles = [
    {
      when: (row: any) => row.isPicked, // 判断行是否被选中
      style: {
        backgroundColor: '#ededed', // 选中行的背景色
        color: '#000', // 可选：设置文字颜色
      },
    },
    {
      when: (row: any) => row.lockId === selectedLockId,
      style: {
        backgroundColor: 'yellow',
        color: 'black',
      },
    },
  ];
  //

  //
  const columnsItemList = [
    {
      name: '#',
      width: '10%',
      selector: (row: any) => row.rowNumber,
      cell: (row: any, index: number) => index + 1, // index 从 0 开始，所以加 1
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: 'ItemInfo',
      width: '90%',
      selector: (row: any) => [row.invoice_no],
      sortable: false,
      cell: (row: any, index: number) => (
        <div
          style={{ cursor: 'pointer', width: '100%', height: '100%' }}
          onClick={() => {
            // if (!row.isPicked) {
            //   setSelectedLockId(row.lockId);
            //   setCurrentItem(row);
            // }
          }} // 绑定行点击事件
        >
          <Stack gap={2}>
            <div>
              {row.location && (
                <span className={` bg-danger text-white p-1 tx-22 mg-r-6`}>
                  {row.location}
                </span>
              )}

              <span className={`bg-green text-white p-1  tx-22`}>
                {row.quantity} / {row.item.base_unit.name}
              </span>
            </div>
            <span className={` tx-danger  tx-16`}>
              <mark>{row.itemName}</mark>
            </span>

            {row.item.upc && (
              <span>
                UPC:
                <span className={` tx-primary tx-14`}>{row.item.upc}</span>
              </span>
            )}
            {row.batchNumber && row.batchNumber !== 'N/A' && (
              <span>
                Batch#:
                <span className={` tx-primary tx-14`}>{row.batchNumber}</span>
              </span>
            )}
            {row.expiryDate && row.expiryDate !== 'N/A' && (
              <span>
                ExpiryDate:
                <span className={` tx-primary tx-14`}>{row.expiryDate}</span>
              </span>
            )}
          </Stack>
        </div>
      ),
    },

    // {
    //   name: 'Op',
    //   width: '15%',
    //   sortable: false,
    //   cell: (row: any) => {
    //     return (
    //       !row.is_approved && (
    //         <div className="">
    //           <IconButton
    //             color="primary"
    //             aria-label="Delete"
    //             onClick={() => {
    //               setCurrentRowId(row.id);
    //             }}
    //           >
    //             <EditNote />
    //           </IconButton>
    //         </div>
    //       )
    //     );
    //   },
    // },
  ];

  return (
    <span className="datatable">
      {data?.length > 0 && (
        <DataTable
          title=""
          //@ts-ignore
          columns={columnsItemList}
          data={data}
          fixedHeader
          //pagination={true}
          customStyles={customStylesForDataTable}
          conditionalRowStyles={conditionalRowStyles} // 设置条件样式
        />
      )}
    </span>
  );
}
