import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faLock, 
    faUnlock
} from '@fortawesome/free-solid-svg-icons';
import styles from './UploadOptions.module.css';

export default function UploadOptions(props){
    return (
        <div id={styles['options']}>
            <div onClick={() => {props.switchEncryptionState()}} className={styles['clickable-option']}>
                {props.enableEncryption ? (
                    <>
                        <FontAwesomeIcon id={styles['encryption-icon']} className={styles['icon']} icon={faUnlock}  size="lg" />
                        <p className={styles['option-text']}>
                            Decrypt Upload
                        </p>
                    </>
                ) : (
                    <>
                        <FontAwesomeIcon id={styles['encryption-icon']} className={styles['icon']} icon={faLock}  size="lg" />
                        <p className={styles['option-text']}>
                            Encrypt Upload
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}