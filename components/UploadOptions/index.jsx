import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faLock, 
    faUnlock,
    faClock,
    faEye, 
    faPen,
} from '@fortawesome/free-solid-svg-icons';
import styles from './UploadOptions.module.css';

export default function UploadOptions(props){
    return (
        <div id={styles['options']}>
            <div onClick={() => {props.switchEncryptionState()}} className={styles['clickable-option']}>
                {props.enableEncryption ? (
                    <>
                        <FontAwesomeIcon className={`${styles['crypto-icon']} ${styles['icon']}`} icon={faUnlock}  size="lg" />
                        <p className={styles['crypto-option-text']}>
                            Decrypt Upload
                        </p>
                    </>
                ) : (
                    <>
                        <FontAwesomeIcon className={`${styles['crypto-icon']} ${styles['icon']}`} icon={faLock}  size="lg" />
                        <p className={styles['crypto-option-text']}>
                            Encrypt Upload
                        </p>
                    </>
                )}
            </div>
            <div onClick={() => {props.changeViewAmount()}} id={styles['timer-div']} className={styles['clickable-option']}>
                <FontAwesomeIcon id={styles['eye-icon']} className={styles['icon']} icon={faEye}  size="lg" />
                <p id={styles['view-amount-option-text']}>
                    {props.viewAmount}
                </p>
            </div>
            <div onClick={() => {props.changeExpiry()}} id={styles['expiry-div']} className={styles['clickable-option']}>
                <FontAwesomeIcon id={styles['clock-icon']} className={styles['icon']} icon={faClock}  size="lg" />
                <p id={styles['expiry-amount-option-text']}>
                    {props.expiry}
                </p>
            </div>
            <div onClick={() => {props.addNote()}} className={styles['clickable-option']}>
                <FontAwesomeIcon id={styles['pen-icon']} className={styles['icon']} icon={faPen}  size="lg" />
                <p id={styles['note-option-text']}>
                    Leave A Note
                </p>
            </div>
        </div>
    )
}