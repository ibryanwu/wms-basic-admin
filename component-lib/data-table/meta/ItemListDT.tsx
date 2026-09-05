import { Button, Divider, IconButton } from '@mui/material';
import { EditNote, DeleteForever } from '@mui/icons-material';
import { useAtom } from 'jotai';
import {
  editItemAtom,
  itemListAtom,
  openItemModalAtom,
  openPurItemDrawerAtom,
} from '@/stores/atom';
import DataTable from 'react-data-table-component';
import { Stack } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { useGetOneItemsById } from '@/rest/items';
import { ItemDialog } from '@/component-lib/modal/meta/ItemDialog';
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

export default function MetaItemListDataTable(props: any) {
  const { data: metaItemList } = props;
  // Values  -------------------------------------------------
  // Auth ----------------------------------------------------
  // Atoms ---------------------------------------------------
  const [_open, setOpenItemModal] = useAtom(openItemModalAtom);
  // UseState  -----------------------------------------------
  const [deleteToggle, setDeleteToggle] = useState(false);
  const [editItem, setEditItem] = useState(undefined);

  // UseForm  ------------------------------------------------
  // Hooks  --------------------------------------------------
  const { t } = useTranslation('items'); // 加载 xxx.json 翻译文件
  //const { data: metaItemList } = useGetAllItems({ isActive: true });
  const { mutate: getOneItemById, data: oneItemData } = useGetOneItemsById();
  // Use Effect  ---------------------------------------------

  // Function ------------------------------------------------

  //
  //

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
      name: t('dtlb_item'),
      width: '300px',
      selector: (row: any) => [row.item.plu],
      sortable: false,
      cell: (row: any, index: number) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setEditItem(row);
            setOpenItemModal(true);
          }}
        >
          {row ? (
            <Stack direction="vertical" gap={1}>
              <span className=" text-success" style={{ fontSize: 16 }}>
                {`${row.name_localizations.zh || ''}`}
                {`${row.name_localizations.en || ''}`}
              </span>
              {row.spec && <span>SPEC: {row.spec}</span>}
              {row.sku && <span>SKU: {row.sku}</span>}
              {row.plu && <span>PLU: {row.plu}</span>}
              {row.upc && <span>UPC: {row.upc}</span>}

              <span style={{ color: 'orange' }}>{row.remarks}</span>
            </Stack>
          ) : null}
        </div>
      ),
    },
    {
      name: t('dtlb_category'),
      width: '150px',
      selector: (row: any) => [row.category],
      sortable: false,
      cell: (row: any, index: number) => (
        <div>
          {row ? (
            <Stack direction="vertical" gap={1}>
              {row.category && (
                <div>
                  <span
                    style={{ color: 'blue' }}
                  >{`[${row.category.name}]`}</span>
                </div>
              )}
            </Stack>
          ) : null}
        </div>
      ),
    },
    {
      name: t('dtlb_base_unit'),
      width: '100px',
      selector: (row: any) => [row.base_unit],
      sortable: false,
      cell: (row: any, index: number) => (
        <div>
          {row ? (
            <Stack direction="vertical" gap={1}>
              <span style={{ fontSize: 14 }}>{row.base_unit.name || ''}</span>
              {/* <span style={{ fontSize: 14 }}>
                P.O:{row.pur_unit.name || ''}
              </span>
              <span style={{ fontSize: 14 }}>
                Exchange Rate:{row.exchange_rate || ''}
              </span> */}
            </Stack>
          ) : null}
        </div>
      ),
    },
    {
      name: t('dtlb_case_unit'),
      width: '100px',
      selector: (row: any) => [row.case_unit],
      sortable: false,
      cell: (row: any, index: number) => (
        <div>
          {row ? (
            <Stack direction="vertical" gap={1}>
              <span style={{ fontSize: 14 }}>{row.case_unit?.name || ''}</span>
            </Stack>
          ) : null}
        </div>
      ),
    },
    {
      name: t('dtlb_customer_owned'),
      width: '200px',
      selector: (row: any) => [row.vendor.name],
      sortable: false,
      cell: (row: any, index: number) => (
        <div>
          {row ? (
            <Stack direction="vertical" gap={1}>
              <span style={{ color: 'blue' }}>{row.vendor?.name}</span>
            </Stack>
          ) : null}
        </div>
      ),
    },
    {
      name: t('dtlb_tax_rate'),
      width: '60px',
      selector: (row: any) => [row.tax_rate],
      sortable: false,
      cell: (row: any, index: number) => (
        <div>
          {row ? (
            <Stack direction="vertical" gap={1}>
              {row.tax_rate && (
                <span>Rate: {parseFloat(row.tax_rate).toFixed(2)}%</span>
              )}
            </Stack>
          ) : null}
        </div>
      ),
    },
    {
      name: t('dtlb_other'),
      width: '200px',
      selector: (row: any) => [row.aisle],
      sortable: false,
      cell: (row: any, index: number) => (
        <div>
          {row ? (
            <Stack direction="vertical" gap={1}>
              <span>Aisle: {row.aisle}</span>
              <span>
                Min Inv: {parseFloat(row.minimum_inventory).toFixed(2)}
              </span>
            </Stack>
          ) : null}
        </div>
      ),
    },
    {
      name: t('dtlb_available'),
      width: '130px',
      selector: (row: any) => [row.is_available],
      sortable: false,
      cell: (row: any, index: number) => (
        <div style={{ cursor: 'pointer' }}>
          {row ? (
            <div className="wd-40">
              {row.is_available ? (
                <span className="badge bg-warning badge-pill me-1 ">
                  Active
                </span>
              ) : (
                <span className="badge bg-gray-500 badge-pill me-1 ">
                  Inactive
                </span>
              )}
            </div>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div>
      <ItemDialog
        editingItem={editItem}
        showAddBt={false}
        setEditItem={setEditItem}
      />

      <span className="datatable">
        {metaItemList &&
        Array.isArray(metaItemList) &&
        metaItemList?.length > 0 ? (
          <DataTable
            title=""
            //@ts-ignore
            columns={columnsItemList}
            data={metaItemList}
            fixedHeader
            pagination={false}
            customStyles={customStylesForDataTable}
            //conditionalRowStyles={conditionalRowStyles}
          />
        ) : null}
      </span>
    </div>
  );
}
