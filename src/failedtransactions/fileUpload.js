import React, { useState } from 'react';
import XMLParser from 'react-xml-parser';
import './fileUpload.css';

export default function FileUpload() {
    const [transactions, setTransactions] = useState([]);
    const [showHideFailedTrans, setShowHideFailedTrans] = useState(false)
    let fileFormat = '';

    // Event handler that is used to read the file uploaded based on two file format CSV and XML
    // and then convert the response to an array and set it to state variable
    // Event handler that is used to populate failed transactions based on 2 criteria 
    // 1. Duplicate refernce transaction id
    // 2. Sum of start balance and mutation key should be equal to end balance

    const handleRecordValidation = (e) => {
        let file = document.getElementById("fileReport").files[0];

        if (file) {
            fileFormat = file.name.split('.')[1];
            let reader = new FileReader();
            if(fileFormat === 'xml') {
                reader.readAsText(file);
            } else if(fileFormat === 'csv') {
                reader.readAsText(file,'ISO-8859-1');
            }
            reader.onload = function (evt) {
                if (fileFormat === 'xml') {
                    const jsonDataFromXml = new XMLParser().parseFromString(evt.target.result);
                    xmlFileToArray(jsonDataFromXml.children);
                } else if (fileFormat === 'csv') {
                    const text = evt.target.result;
                    csvFileToArray(text);
                }
            }
            reader.onerror = function (evt) {
                document.getElementById("fileReport").innerHTML = "error reading file";
            }
        } else if(!file) {
            alert('Please upload a file (either in csv or xml format)');
            document.getElementById("fileReport").value = '';
            return false;
        }
        e.preventDefault()
    }

    const xmlFileToArray = records => {
        const array = records.map(rec => {
            var obj = {}
            obj['reference'] = rec.attributes.reference
            rec.children.map(item => {
                obj[item.name] = item.value
            })
            return obj;
        })
        const transactionRecords = failedTransactions(array)
        setTransactions(transactionRecords)
        if (transactionRecords.length > 0) {
            setShowHideFailedTrans(true)
        } else {
            setShowHideFailedTrans(false)
        }
    }

    const csvFileToArray = string => {
        const updatedString = string.replaceAll('\r','')
        const csvHeader = updatedString.slice(0, updatedString.indexOf("\n")).split(",");
        const csvRows = updatedString.slice(updatedString.indexOf("\n") + 1).split("\n");

        if(csvRows.length == 1 && csvRows[0] == '') {
            alert("No data found")
            return false
        }
        const array = csvRows.map(i => {
            const values = i.split(",");
            const obj = csvHeader.reduce((object, header, index) => {
                object[header] = values[index];
                return object;
            }, {});
            return obj;
        });
        const transactionRecords = failedTransactions(array)
        setTransactions(transactionRecords);
        if (transactionRecords.length > 0) {
            setShowHideFailedTrans(true)
        } else {
            setShowHideFailedTrans(false)
        }
    };

    /* Function failed Transactions is used to populate failed transaction records based on duplilcate ref id and 
    end balance calculation */

    const failedTransactions = (records) => {
        const referenceIdKey = fileFormat === 'xml' ? 'reference' : 'Reference'
        const mutationKey = fileFormat === 'xml' ? 'mutation' : 'Mutation'
        const startBalanceKey = fileFormat === 'xml' ? 'startBalance' : 'Start Balance'
        const endBalanceKey = fileFormat === 'xml' ? 'endBalance' : 'End Balance'
        const accountNumberKey = fileFormat === 'xml' ? 'accountNumber' : 'Account Number'
        const descriptionKey = fileFormat === 'xml' ? 'description' : 'Description'
        const duplicateIndices = [];
        const failedTransactionsData = [];
        for (let i = 0; i < records.length; i++) {
            // To check duplicate records
            for (let j = i + 1; j < records.length; j++) {
                if (records[i][referenceIdKey] === records[j][referenceIdKey]) {
                    const index = !duplicateIndices.includes(i) ? i : j;
                    duplicateIndices.push(index);
                    let obj = {}
                    obj[referenceIdKey] = records[index][referenceIdKey]
                    obj[accountNumberKey] = records[index][accountNumberKey]
                    obj[descriptionKey] = records[index][descriptionKey]
                    obj['Error Description'] = 'Duplicate reference ID found'
                    failedTransactionsData.push(obj);
                }
            }

            // To check wrong end-balance in records which is not already exist in duplicate records list
            if ((Number(records[i][startBalanceKey]) + Number(records[i][mutationKey])).toFixed(2) !== Number(records[i][endBalanceKey]).toFixed(2)) {
                let obj = {}
                obj[referenceIdKey] = records[i][referenceIdKey]
                obj[accountNumberKey] = records[i][accountNumberKey]
                obj[descriptionKey] = records[i][descriptionKey]
                obj['Error Description'] = 'End balance mismatch found'
                failedTransactionsData.push(obj)
            }
        }

        return failedTransactionsData;
    }

    /* Function handleFileTypeValidation is used to upload file of CSV and XML extensions */
    const handleFileTypeValidation = (e) => {
        const fileUpload = document.getElementById("fileReport");
        const fileInput = e.target.value ? e.target.value.split('.').pop() : ''
        const allowedExtensions = /[\.csv|\.xml]+$/
        setShowHideFailedTrans(false)
        if ((fileInput != null || fileInput != '') && (!allowedExtensions.exec(fileInput))) {
            alert('Invalid file type: (Enter xml/csv format)');
            fileUpload.value = '';
            fileUpload.value = null;
            return false;
        }
    }

    const headerKeys = Object.keys(Object.assign({}, ...transactions));

    return (
        <div className='wrapper'>
            <div className='fileupload-section'>
                <label for="fileReport"><h3>Select a file: (either excel/xml format)</h3></label>&nbsp;&nbsp;
                <input id='fileReport' name='fileReport' type='file' onChange={handleFileTypeValidation} /><br />
                <button className='btn-validateReport' id='validateReport' onClick={handleRecordValidation}>View Report</button>
            </div>
            {showHideFailedTrans &&
                <div className='failed-transaction-report'>
                    <h3 style={{ alignContent: 'left' }}>Error transactions</h3>
                    <table style={{ alignItems: 'center' }}>
                        <thead>
                            <tr key={"header"}>
                                {headerKeys.map((key) => (
                                    <th>{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((item, index) => (
                                <tr key={index}>
                                    {Object.values(item).map((val) => (
                                        <td>{val}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    { }
                </div>
            }
        </div>
    )
}