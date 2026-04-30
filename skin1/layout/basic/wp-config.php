<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'atoz0802' );

/** Database username */
define( 'DB_USER', 'atoz0802' );

/** Database password */
define( 'DB_PASSWORD', 'Calix0802!' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'oz+ g$h$~3%a52Y%(VH]eWA]YZ7idQJQ=Z`^FZX]9q>Y@hHw1L;4JN~szs[ChXJ.' );
define( 'SECURE_AUTH_KEY',  '1ZC5baT}aNhRdF#`m31~J~(iueC v_!4g8ACC1Idb:>XjOR^Dw4}KvyK/A1G1z+;' );
define( 'LOGGED_IN_KEY',    'd|Fr5ex$2DQ<1KgToT0vuaH&Y<z238>T.`M#w?pUVkTpI4b;v*pQu0Q%&+!oxa+J' );
define( 'NONCE_KEY',        '>Z1ofG:U^{|Ls|e*&`v*.xfYMXT&gv~JgZSPl,kK8By#<HZ@tw_cJ&]m ^;1L}q)' );
define( 'AUTH_SALT',        '[XDB+JZi6:`Ek*3FY{oS4m.ITBm w!Rs4=r{ONgtGcbNT+:EjS)u_-=p[mC=BqRN' );
define( 'SECURE_AUTH_SALT', '+H`n3K_o:QW&nUU*uex{?JmgRoG[d7`cp;7}EY+D=KM8H)o:hv-C6xyqjyF< yyF' );
define( 'LOGGED_IN_SALT',   ';a3W1f]({(F44?VC76RnYVbts]+mx@1g >/9K>h0ZoqR+-f>zF`Tc2~C9iQJn)qF' );
define( 'NONCE_SALT',       '7V_bo[xI%QehS1.{)ITA-,Eh. +y%} SEnW~!;l,c7H]}RE PE`B+/y1?JubAv*a' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
