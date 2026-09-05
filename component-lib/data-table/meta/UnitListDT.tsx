import { Button, Divider, IconButton } from '@mui/material';
import { EditNote, DeleteForever } from '@mui/icons-material';
import { useAtom } from 'jotai';
import {
  editItemAtom,
  itemListAtom,
  openPurItemDrawerAtom,
  openUnitModalAtom,
} from '@/stores/atom';
import DataTable from 'react-data-table-component';
import { Stack } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { UnitDialog } from '@/component-lib/modal/meta/UnitDialog';
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

const conditionalRowStyles = [];

export default function UnitListDataTable(props: any) {
  const { data } = props;
  const { t } = useTranslation('unit');
  const { t: t0 } = useTranslation('common');
  const [_open, setOpenUnitModal] = useAtom(openUnitModalAtom);
  //
  const [deleteToggle, setDeleteToggle] = useState(false);
  const [editItem, setEditItem] = useState(undefined);

  //

 

  //
  const columnsItemList = [
    {
      name: '#',
      width: '100px',
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
      name: t('lb_name'),
      width: '300px',
      selector: (row: any) => [row.name],
      sortable: false,
      cell: (row: any, index: number) => (
        <div>
          <Stack direction="vertical" gap={1}>
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setEditItem(row);
                setOpenUnitModal(true);
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
      name: t('lb_remarks'),
      width: '300px',
      selector: (row: any) => [row.remarks],
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <Stack direction="vertical" gap={1}>
            <div>{row.remarks}</div>
          </Stack>
        </div>
      ),
    },
    {
      name: t('lb_active'),
      selector: (row: any) => [row.isActive],
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <div className="wd-40">
            {row.isActive ? (
              <span className="badge bg-warning badge-pill me-1 ">Active</span>
            ) : (
              <span className="badge bg-gray-500 badge-pill me-1 ">
                {t('lb_inactive')}
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
    //       <IconButton
    //         color="warning"
    //         aria-label="Delete"
    //         onClick={() => {
    //           //赠品随便删除
    //           //如果不是赠品，判断是否使用过
    //           if (!row.is_promotional_item) {
    //             if (row.promotional_relationship_value_percentages > 0) {
    //               toast.error(
    //                 'This Item has Promotional or Gift Item, please delete Promotional Item first.',
    //                 {
    //                   position: 'top-center',
    //                   theme: 'colored',
    //                   autoClose: 8000,
    //                 },
    //               );
    //               return;
    //             }
    //           }
    //         }}
    //       >
    //         <DeleteForever />
    //       </IconButton>
    //     </div>
    //   ),
    // },
  ];

  return (
    <div>
      <UnitDialog
        editingItem={editItem}
        showAddBt={false}
        setEditItem={setEditItem}
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
