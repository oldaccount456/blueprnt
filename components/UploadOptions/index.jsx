import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faLock, 
    faUnlock,
    faClock
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
            <div onClick={() => {props.changeExpiry()}} className={styles['clickable-option']}>
                <FontAwesomeIcon id={styles['clock-icon']} className={styles['icon']} icon={faClock}  size="lg" />
                <p id={styles['expiry-option-text']}>
                    {props.expiry}
                </p>
            </div>
        </div>
    )
}