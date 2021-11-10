import 'firebase/analytics';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { Button, Table, Popover, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TOTAL_CAPACITY } from "./constants";
import { makeArrayChunks } from './Utils';

const ROW_LENGTH = 10;

const firebaseConfig = {
    apiKey: "AIzaSyCVaurIhk9UaFHjHRC4H-ij65il_wjuEJ0",
    authDomain: "smartparking-2972e.firebaseapp.com",
    projectId: "smartparking-2972e",
    storageBucket: "smartparking-2972e.appspot.com",
    messagingSenderId: "1049986413371",
    appId: "1:1049986413371:web:91494b40aa9a0f34133d1e"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
}

export const auth = firebase.auth();
const firestore = firebase.firestore();

// ------------------------------ Database Refs ------------------------------
const databaseRef = firestore.collection('carDetails');
const userDatabaseRef = firestore.collection('userDetails')
const generalDatabaseRef = firestore.collection('generalDetails')


// ------------------------------ CRUD FUNCTIONS ------------------------------

export const addUserDetails = async (numberPlate, mobile) => {
    const { uid } = auth.currentUser;
    await userDatabaseRef.add({
        uid,
        numberPlate,
        mobile
    })
}

export const getUserDetails = async () => {
    const { uid } = auth.currentUser;
    let snapshot = await userDatabaseRef.where('uid', '==', uid).get()
    if (snapshot.empty) {
        console.log("User doesn't exist")
        return null;
    }
    let documentId = ''
    snapshot.forEach(doc => {
        console.log({ doc })
        documentId = doc.id
    })
    let user = (await userDatabaseRef.doc(documentId).get()).data();
    console.log("user found at - ", { documentId, user })
    return user;
}

export const resetUserDetails = async () => {
    const { uid } = auth.currentUser;
    let snapshot = await userDatabaseRef.where('uid', '==', uid).get()
    if (snapshot.empty) {
        console.log("User doesn't exist")
        return null;
    }
    let documentId = ''
    snapshot.forEach(doc => {
        console.log({ doc })
        documentId = doc.id
    })
    documentId && await userDatabaseRef.doc(documentId).delete();
}

export const addDefaultGeneralDetails = async () => {
    await generalDatabaseRef.doc('generalDetails').set({
        parkingList: new Array(TOTAL_CAPACITY).fill(0)
    })
}


export const addCar = async (position, numberPlate) => {
    const { uid, displayName } = auth.currentUser;

    await databaseRef.doc(numberPlate).set({
        carNumber: numberPlate,
        uid,
        displayName,
        position
    })

    // await addCarInParkingList(position);
}

export const removeCar = async (position) => {
    console.log("searching for ", position)
    const snapshot = await databaseRef.where('position', '==', position).get()
    let documentId = ''
    snapshot.forEach(doc => {
        documentId = doc.id
    })
    console.log("found at - ", { documentId })
    documentId && await databaseRef.doc(documentId).delete();
    await removeCarFromParkingList(position);
}

export const searchCar = async (numberPlate) => {
    let snapshot = await databaseRef.where('carNumber', '==', numberPlate).get()
    if (snapshot.empty)
        return false;
    let result = [];
    snapshot.docs.forEach(doc => {
        console.log(doc.id, " => ", doc.data());
        result.push(doc.data());
    })
    return result;
}


export const getParkingList = async () => {
    // let snapshot = await databaseRef.get();
    // if (snapshot.empty) {
    //     console.log("car database empty")
    //     return new Array(TOTAL_CAPACITY).fill(0);
    // }

    // const allParkedCars = snapshot.docs.map(doc => doc.data());
    const allParkedCars = await getAllParkedCars();
    let parkingList = new Array(TOTAL_CAPACITY).fill(0);
    allParkedCars.forEach(parkedCar => {
        parkingList[parkedCar.position] = 1;
    })
    return parkingList;
    // let snapshot = await generalDatabaseRef.doc('generalDetails').get();
    // if (!snapshot.exists) return [];
    // let { parkingList } = snapshot.data();
    // return parkingList;
}

export const getAllParkedCars = async () => {
    let snapshot = await databaseRef.get();
    if (snapshot.empty) {
        console.log("car database empty")
        return new Array(TOTAL_CAPACITY).fill(0);
    }

    const allParkedCars = snapshot.docs.map(doc => doc.data());
    return allParkedCars;
}

export const addCarInParkingList = async (position) => {
    let parkingList = await getParkingList();
    if (parkingList[position] === 0) {
        parkingList[position] = 1;
        await generalDatabaseRef.doc('generalDetails').set({
            parkingList
        })
        console.log('Parked Successfully')
        return 'Parked Successfully';
    }
    else {
        console.log('Parking Spot Already Taken')
        return 'Parking Spot Already Taken'
    }
}

export const removeCarFromParkingList = async (position) => {
    let parkingList = await getParkingList();
    parkingList[position] = 0;
    await generalDatabaseRef.doc('generalDetails').set({
        parkingList
    })
}


export const getParkingMatrix = async () => {
    let parkingList = await getParkingList();
    let allParkedCars = await getAllParkedCars();
    let carArray = new Array(TOTAL_CAPACITY).fill(0);
    allParkedCars.forEach(car => { carArray[car.position] = car })

    console.log({ carArray })
    if (!parkingList) return '';
    let splittedParkingList = makeArrayChunks(parkingList, ROW_LENGTH)
    console.log({ splittedParkingList })

    const carDetailsPopover = (position) => {
        const isEmpty = carArray[position-1] === 0;
        return (
            <Popover id="popover-basic">
                <Popover.Header as="h3">{isEmpty? 'Free Space':'Parked!'}</Popover.Header>
                {!isEmpty && <Popover.Body>
                    <strong>Car Number - </strong>{carArray[position - 1]?.carNumber}<br />
                    <strong>Owner Name - </strong>{carArray[position - 1]?.displayName}<br />
                </Popover.Body>}
            </Popover>
        )
    }

    let matrixEl = <Table striped bordered hover>
        <thead>
            <tr>
                <th colSpan={ROW_LENGTH}>Parking Matrix</th>
            </tr>
        </thead>
        <tbody>
            {splittedParkingList.map((chunk, parkingIndex) => {
                return <tr key={parkingIndex}>
                    {
                        chunk.map((slot, ind) => {
                            let parkingNumber = (parkingIndex) * 10 + ind + 1;
                            return (
                                <OverlayTrigger placement="right" overlay={carDetailsPopover(parkingNumber)}>
                                    <td key={ind}>{slot === 0 ? `${parkingNumber}✅` : `${parkingNumber}🚗`}</td>
                                </OverlayTrigger>
                            )
                        })}
                </tr>
            })}
        </tbody>
    </Table>
    return matrixEl;
}

export const getVacantSlot = async () => {
    let parkingList = await getParkingList()
    let message = 'No Slot Found'

    if (parkingList) {
        parkingList.some((slot, index) => {
            if (slot === 0) {
                message = `Please park at position ${index + 1}`;
                return true;
            }
        })
        return message;
    }
    else {
        return 'Error Fetching Vacant Slot';
    }
}

// ------------------------------ COMPONENTS ------------------------------
export const SignIn = () => {

    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    }

    return <Button variant='danger' className="icon-btn my-2" onClick={signInWithGoogle}><i className="fab fa-google" /> Sign in with Google</Button>
}


export const SignOut = () => {
    return auth.currentUser && (
        <Button variant='danger' className="" onClick={() => auth.signOut()}>Sign Out</Button>
    )
}