import { Button, Divider, IconButton } from '@mui/material';
import { EditNote, DeleteForever } from '@mui/icons-material';
import { useAtom } from 'jotai';
import {
  editItemAtom,
  itemListAtom,
  openPurItemDrawerAtom,
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

const conditionalRowStyles = [
  // {
  //   //小于30%利润的商品
  //   when: (row: any) => {
  //     return row.price_base * 1.38 > parseFloat(row.item.lastest_sales_price);
  //   },
  //   style: {
  //     backgroundColor: '#ffebd6',
  //     //color: 'white',
  //     // '&:hover': {
  //     //   cursor: 'pointer',
  //     // },
  //   },
  // },
  {
    //退货的商品
    when: (row: any) => {
      return row.total.total < 0;
    },
    style: {
      backgroundColor: '#ffd1d1',
      //color: 'white',
      // '&:hover': {
      //   cursor: 'pointer',
      // },
    },
  },
  // {
  //   //赠品背景为浅绿
  //   when: (row: any) => row.is_promotional_item === true,
  //   style: {
  //     backgroundColor: '#e3fce9',
  //     //color: 'white',
  //     // '&:hover': {
  //     //   cursor: 'pointer',
  //     // },
  //   },
  // },
];

// 这是旧进货单显示单据明细item的组件 ，停用
export default function ItemListDataTable(props: any) {
  const [itemListDatas, setItemListDatas] = useAtom(itemListAtom);
  const [_edit, setEditItem] = useAtom(editItemAtom);
  const [_open, setOpenPurItemDrawer] = useAtom(openPurItemDrawerAtom);
  //
  const [deleteToggle, setDeleteToggle] = useState(false);
  //
  useEffect(() => {
    props.calculate();
  }, [deleteToggle]);

  //
  const columnsItemList = [
    {
      name: '#',
      width: '50px',
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
      name: 'Items',
      width: '300px',
      selector: (row: any) => [row.item.plu],
      sortable: false,
      cell: (row: any, index: number) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setEditItem({ ...row, index });
            setOpenPurItemDrawer(true);
          }}
        >
          <Stack direction="vertical" gap={1}>
            {row.is_promotional_item && (
              <div className="wd-40">
                <span className="badge bg-warning badge-pill me-1 ">
                  Promotional
                </span>
              </div>
            )}
            111
            {row.barcode ? <span>barcode: {row.barcode}</span> : null}
            <span style={{ fontSize: 16 }}>{row.label}</span>
            <div>
              {row.item.barcode}
              {' SPEC: '}
              <span style={{ color: 'blue' }}>{row.item.spec}</span>
            </div>
            <span style={{ color: 'blue' }}>{row.remark}</span>
          </Stack>
        </div>
      ),
    },
    {
      name: 'Qty(Pur)',
      width: '200px',
      selector: (row: any) => [row.qty_pur],
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <Stack direction="vertical" gap={1}>
            <div>
              <span style={{ fontSize: 18 }}>{row.qty_pur}</span>
              <span className="mg-l-2"> x {row.pur_unit_id.name}</span>
            </div>
            <div style={{ color: 'gray' }}>
              <span> = {row.qty_base}</span>
              <span className="mg-l-2">x {row.base_unit_id.name}</span>
            </div>
            <div style={{ color: 'gray' }}>
              <span>
                1{row.pur_unit_id.name} = {`${row.exchange_rate}`}
              </span>
              <span className="mg-l-2"> {row.base_unit_id.name}</span>
            </div>
            {row.is_partial_received && (
              <Stack direction="vertical">
                <span className="badge bg-warning me-1">Partial Received</span>
                <span> Received QTY {row.received_qty}</span>
              </Stack>
            )}
          </Stack>
        </div>
      ),
    },
    {
      name: 'Unit Price',
      width: '200px',
      selector: (row: any) => [row.price_pur],
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <Stack direction="vertical" gap={1}>
            <div>
              <span style={{ fontSize: 18 }}>
                ${parseFloat(row.price_pur).toFixed(2)}
              </span>
              <span className="mg-l-2"> / {row.pur_unit_id.name}</span>
            </div>
            <div>
              {`(`}
              <span>${parseFloat(row.price_base).toFixed(2)}</span>
              <span className="mg-l-2">/ {row.base_unit_id.name}</span>
              {`)`}
            </div>

            {row.promotional_allocated_cost_pur &&
            row.promotional_allocated_cost_pur > 0 ? (
              <Stack>
                <Divider />
                <span>
                  Cost: ${row.promotional_allocated_cost_pur.toFixed(2)}/{' '}
                  {row.pur_unit_id.name}
                </span>
                <span>
                  CostUnit: $
                  {(
                    row.promotional_allocated_cost_pur /
                    parseFloat(row.exchange_rate)
                  ).toFixed(2)}
                  / {row.base_unit_id.name}
                </span>
              </Stack>
            ) : null}
          </Stack>
        </div>
      ),
    },
    {
      name: 'Total ',
      width: '200px',
      selector: (row: any) => [row.tax_rate],
      sortable: false,
      cell: (row: any) => (
        <>
          {row.total && (
            <div className="">
              <Stack>
                <div className="d-flex flex-row-reverse">
                  {row.is_promotional_item ? (
                    <>
                      <span className={clsx('tx-16')}>Total: 0</span>
                    </>
                  ) : (
                    <span className={clsx('tx-16 ')}>
                      Total:
                      <span className="mg-l-6">
                        {row.total.total.toFixed(2)}
                      </span>
                    </span>
                  )}
                </div>{' '}
                {row.is_promotional_item && (
                  <div className="d-flex flex-row-reverse">
                    <del>
                      <span>
                        Total:
                        <span className="mg-l-6">
                          {row.total.total.toFixed(2)}
                        </span>
                      </span>
                    </del>
                  </div>
                )}
                <div className="d-flex flex-row-reverse">
                  <span className="tx-gray-600">
                    SubTotal:
                    <span className="mg-l-6">
                      {row.total.subtotal.toFixed(2)}
                    </span>
                  </span>
                </div>
                <div className="d-flex flex-row-reverse">
                  <span className="tx-gray-600">
                    Tax:
                    <span className="mg-l-6">{row.total.tax.toFixed(2)}</span>
                  </span>
                </div>
              </Stack>
            </div>
          )}
        </>
      ),
    },
    {
      name: 'Op',
      width: '6%',
      sortable: false,
      cell: (row: any) => (
        <div className="">
          <IconButton
            color="warning"
            aria-label="Delete"
            onClick={() => {
              //赠品随便删除
              //如果不是赠品，判断是否使用过
              if (!row.is_promotional_item) {
                if (row.promotional_relationship_value_percentages > 0) {
                  toast.error(
                    'This Item has Promotional or Gift Item, please delete Promotional Item first.',
                    {
                      position: 'top-center',
                      theme: 'colored',
                      autoClose: 8000,
                    },
                  );
                  return;
                }
              }

              const tempList = itemListDatas.filter((item) => {
                return item.row_uuid !== row.row_uuid;
              });

              setItemListDatas([...tempList]);
              setDeleteToggle(!deleteToggle);
            }}
          >
            <DeleteForever />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <span className="datatable">
      {itemListDatas?.length > 0 && (
        <DataTable
          title=""
          //@ts-ignore
          columns={columnsItemList}
          data={itemListDatas}
          fixedHeader
          pagination={false}
          customStyles={customStylesForDataTable}
          conditionalRowStyles={conditionalRowStyles}
        />
      )}
    </span>
  );
}
