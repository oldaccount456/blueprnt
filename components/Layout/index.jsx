import Navbar from '@/components/Navbar';
import styles from './Layout.module.css';
export default function Layout(props) {
    return (
        <>
            <style jsx global>{`
                body {

                    background: url(/bg.png) no-repeat center center fixed; 
                    -webkit-background-size: cover;
                    -moz-background-size: cover;
                    -o-background-size: cover;
                    background-size: cover;
                }
            `}</style>    
            <Navbar user={props.user}/>
            <main id={styles['main-section']}>{props.children}</main>
        </>
    )
}
  