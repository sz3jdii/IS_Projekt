import React from "react";
import styled from "styled-components";
import { useTable, usePagination } from "react-table";
import { exportFile } from 'fs-browsers';
import {xml2js} from 'xml-js';

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }

      input {
        font-size: 1rem;
        padding: 0;
        margin: 0;
        border: 0;
      }
    }
  }

  .pagination {
    padding: 0.5rem;
  }
`;
const Btn = styled.label`
  background-color: rgba(51, 51, 51, 0.05);
  border-radius: 8px;
  border-width: 0;
  color: #333333;
  cursor: pointer;
  display: inline-block;
  font-family: "Haas Grot Text R Web", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  list-style: none;
  margin-right: 10px;
  margin-bottom: 10px;
  padding: 10px 12px;
  text-align: center;
  transition: all 200ms;
  vertical-align: baseline;
  white-space: nowrap;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
`;
const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData, 
}) => {
  const [value, setValue] = React.useState(initialValue);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  const onBlur = () => {
    updateMyData(index, id, value);
  };

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return <input value={value} onChange={onChange} onBlur={onBlur} />;
};

const defaultColumn = {
  Cell: EditableCell,
};

function Table({ columns, data, updateMyData, skipPageReset }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      autoResetPage: !skipPageReset,
      updateMyData,
    },
    usePagination
  );

  return (
    <>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>{" "}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
        </button>{" "}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </button>{" "}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {">>"}
        </button>{" "}
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <span>
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: "100px" }}
          />
        </span>{" "}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

function App() {
  const columns = React.useMemo(
    () => [
      {
        Header: "Integracja Systemów - Adam Świątkowski",
        columns: [
          {
            Header: 'ID',
            accessor: 'id' 
          },
          {
            Header: 'Producent',
            accessor: 'producent' 
          },
          {
            Header: 'Przekątna ekranu',
            accessor: 'screenDiagonal' 
          },
          {
            Header: 'Rozdzielczość ekranu',
            accessor: 'screenResolution' 
          },
          {
            Header: 'Typ powierzchni ekranu',
            accessor: 'screenSurfaceType' 
          },
          {
            Header: 'Ekran dotykowy',
            accessor: 'isTouchScreen' 
          },
          {
            Header: 'Procesor',
            accessor: 'CPUName' 
          },
          {
            Header: 'Ilość rdzeni procesora',
            accessor: 'CPUCores' 
          },
          {
            Header: 'Taktowanie procesora',
            accessor: 'CPUTiming' 
          },
          {
            Header: 'Ilość pamięci RAM',
            accessor: 'RAMSize' 
          },
          {
            Header: 'Rozmiar dysku',
            accessor: 'diskSize' 
          },
          {
            Header: 'Typ dysku',
            accessor: 'diskType' 
          },
          {
            Header: 'Karta graficzna',
            accessor: 'GPUName' 
          },
          {
            Header: 'Ilość pamięci karty graficznej',
            accessor: 'GPUMemory' 
          },
          {
            Header: 'System operacyjny',
            accessor: 'OSName' 
          },
          {
            Header: 'Typ napędu optycznego',
            accessor: 'physicalDriveType' 
          }
        ],
      },
    ],
    []
  );

  const [data, setData] = React.useState([]);
  const [skipPageReset, setSkipPageReset] = React.useState(false);
  const columnsValidator = {
    id: new RegExp('/^\d+$/'),
    producent: new RegExp('^[A-Za-z0-9_.-]{0,10}$'),
    screenDiagonal: new RegExp('^[A-Za-z0-9_."]{0,10}$'),
    screenResolution: new RegExp('^[A-Za-z0-9_.-]{0,10}$'),
    screenSurfaceType: new RegExp('^[A-Za-z0-9_.-]{0,10}$'),
    isTouchScreen: new RegExp('^(?:Tak|Nie)'),
    CPUName: new RegExp('^[A-Za-z0-9_.-]{0,10}$'),
    CPUCores: new RegExp('/^\d+$/'),
    CPUTiming: new RegExp('^[A-Za-z0-9_.-]{0,10}$'),
    RAMSize: new RegExp('^[A-Za-z0-9_.-]{0,10}$'),
    diskSize: new RegExp('^[A-Za-z0-9_.-]{0,10}$'),
    diskType: new RegExp('^(?:HDD|SSD)'),
    GPUName: new RegExp('^[A-Za-z0-9_.-]{0,10}$'),
    GPUMemory: new RegExp('^[A-Za-z0-9_.-]{0,10}$'),
    OSName: new RegExp('^[A-Za-z0-9_.-]{0,10}$'),
    physicalDriveType: new RegExp('^(?:Tak|Nie)')
  };
  const updateMyData = (rowIndex, columnId, value) => {
    console.log(columnId);
    if(columnsValidator[columnId].test(value)){
      setSkipPageReset(true);
      setData((old) =>
        old.map((row, index) => {
          if (index === rowIndex) {
            return {
              ...old[rowIndex],
              [columnId]: value,
            };
          }
          return row;
        })
      );
    }else{
      alert('Wprowadzone dane są nieprawidłowe!');
    }
  };

  React.useEffect(() => {
    setSkipPageReset(false);
  }, [data]);


  const storeDataTxt = () => {
    if(data.length !== 0){
      let txtFileContent = '';
      for(const product of data){
        txtFileContent = txtFileContent+
        product.producent+';'+
        product.screenDiagonal+';'+
        product.screenResolution+';'+
        product.screenSurfaceType+';'+
        product.isTouchScreen+';'+
        product.CPUName+';'+
        product.CPUCores+';'+
        product.CPUTiming+';'+
        product.RAMSize+';'+
        product.diskSize+';'+
        product.diskType+';'+
        product.GPUName+';'+
        product.GPUMemory+';'+
        product.OSName+';'+
        product.physicalDriveType+';\n';
      }
      exportFile(txtFileContent, { fileName: 't2_katalog.txt' });
    }else{
      alert('Załaduj najpierw plik źródłowy!');
    }
  };
  const storeDataXml = () => {
    if(data.length !== 0){
      let xmlFileContent = [];
      for(const product of data){
        const laptop = {};
        xmlFileContent.push(product);
      }
      //exportFile(txtFileContent, { fileName: 't2_katalog.txt' });
    }else{
      alert('Załaduj najpierw plik źródłowy!');
    }
  };
  const loadDataTxt = (event) => {
    if(event.target.value.length !== 0){
      setData([]);
      const data = [];
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function() {
        const fileContent = reader.result.split('\n');
        let i = 0;
        for(const fileLine of fileContent){
          const fileField = fileLine.split(';');
          const product = {
            id: ++i,
            producent: fileField[0],
            screenDiagonal: fileField[1],
            screenResolution: fileField[2],
            screenSurfaceType: fileField[3],
            isTouchScreen: fileField[4],
            CPUName: fileField[5],
            CPUCores: fileField[6],
            CPUTiming: fileField[7],
            RAMSize: fileField[8],
            diskSize: fileField[9],
            diskType: fileField[10],
            GPUName: fileField[11],
            GPUMemory: fileField[12],
            OSName: fileField[13],
            physicalDriveType: fileField[14],
          };
          data.push(product);
        }
        setData(data);
      }
    }
  };

  const loadDataXml = (event) => {
    if(event.target.value.length !== 0){
      setData([]);
      const data = [];
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function() {
        const fileContent = xml2js(reader.result, {compact: true});
        for(const productLine of fileContent.laptops.laptop){
          const product = {
            id: productLine._attributes.id,
            producent: productLine.manufacturer._text,
            screenDiagonal: productLine.screen.size._text,
            screenResolution: productLine.screen.resolution._text,
            screenSurfaceType: productLine.screen.type._text,
            isTouchScreen: productLine.screen._attributes.touch == 'yes' ? 'Tak' : 'Nie',
            CPUName: productLine.processor.name._text,
            CPUCores: productLine.processor.physical_cores._text,
            CPUTiming: productLine.processor.clock_speed._text,
            RAMSize: productLine.ram._text,
            diskSize: productLine.disc.storage._text,
            diskType: productLine.disc._attributes !== undefined ? productLine.disc._attributes.type : null,
            GPUName: productLine.graphic_card.name._text,
            GPUMemory: productLine.graphic_card.memory._text,
            OSName: productLine.os._text,
            physicalDriveType: productLine.disc_reader._text,
          }
          
          data.push(product);
        }
        setData(data);
      };
    }
  };
  return (
    <Styles>
      <Btn>
        Wybierz plik TXT
        <input style={{ display: "none" }} type="file" onChange={loadDataTxt}/>
      </Btn>
      <Btn>
        Wybierz plik XML
        <input style={{ display: "none" }} type="file" onChange={loadDataXml}/>
      </Btn>
      <Btn onClick={storeDataTxt}>
        Zapisz dane do pliku TXT
      </Btn>
      <Btn onClick={storeDataXml}>
        Zapisz dane do pliku XML
      </Btn>
      <Table
        columns={columns}
        data={data}
        updateMyData={updateMyData}
        skipPageReset={skipPageReset}
      />
    </Styles>
  );
}

export default App;
