var admin = require("firebase-admin");

var serviceAccount = require("../public_service_account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function activation(credentials, settings_ds) {
  return [1, "License activated successfully!"];

  // if (key == "") {
  //   key = settings_ds.get_D("key")
  // }

  // LexActivator.SetProductData("MkIyNEUwNDFGM0Q1RTZGNEI3Q0I5MjY5OTVDN0FBMUI=.xiRnFQQA/wIPfZUbQGs4OXu9cOiJFk+WHFW82g64PWn2jWX/2NNnVn982nZ+PaOYTmNZOWKXd0qt8+HY47sRiUs2jjW3FqIa8d51ibNmHXkIHT+4Lqrv9dZt+9g2sqiRFjO9foI0jlecKDFhrnYXGNrbsCZ6vGQK3gpKaaDe3zpf8cq44ZiUCUSEF4Zm30ljQb8qQ94Xxg35DZepzUk1lQAVw5+vmh0N5XIwcna9ApADxX34LiZS3qJyKByBvU3buQzYBR/Mvogqz2nJhuh5ywDyHAGkLAUP3oLWewZf0baNYAfFlhsfl/nGIpyLIBbQ1ZQTGhaT6MWICreBgvDTVQ/rvJbLxOSI3N+ls/oLOAefsHXSdbdclABap0OmWSkOrxsfFqzEasgMbgAbjApr4YSPbEKmolPmjlSVbobeqpzuSjO3asDnLWqVP4lp7Azj6kZE2+AYQPPLZs05q/7BCQh0QRgYAUYt96BwgAoB5VumWLRMbLcmk04A/o9O7MkgVNz7FxuHxzvLnHgyFTAmKiGfr3Y55zh3Lc5nhSeERQ4MYjiz6Dbu/HBxsEL+eo+QrM0WMXfUhvmOkIAQJnMRnl30rpHsWmx8amhsthg1fZQbr+3oh23+vC6YCe+9eiF5pdYxOLro2mck1tRY3qgLJpfm5NsUr42GSvp2yYxEMzBuA6qGf3zg8a8qPpRVhcMXxa7cfqR9apKKe3HXF2B6j5npIMdCIfZW7OVy3Fex54I=");
  // LexActivator.SetProductId("701bf685-7886-45e0-aa14-7dabe5ad1627", PermissionFlags.LA_USER);
  // try {
  //   LexActivator.SetLicenseKey(key);
  //   LexActivator.SetActivationMetadata('key1', 'value1');
  //   const status = LexActivator.ActivateLicense();
  //   if (LexStatusCodes.LA_OK == status) {
  //     settings_ds.add_D("key", key)
  //     return [1, 'License activated successfully!'];
  //   } else if (LexStatusCodes.LA_EXPIRED == status) {
  //     return [0, 'License activated successfully but has expired!'];
  //   } else if (LexStatusCodes.LA_SUSPENDED == status) {
  //     return [0, 'License activated successfully but has been suspended!'];
  //   } else if (LexStatusCodes.LA_FAIL == status) {
  //     return [-1, 'License failed to activate!'];
  //   }
  // } catch (error) {
  //   console.log(error);
  //   try {
  //     request.get("http://api.seigrobotics.com:5000/del_activation?key=" + key, (error, res, body) => {
  //       if (error) {
  //         console.error(error)
  //         return
  //       }
  //     })
  //   } catch (error) {
  //     console.log(error);
  //   }
  //   return [0, error.message, error.code];
  // }
}

async function resetPwd(key, settings_ds) {
  return [1, "License activated successfully!"];

  // if (key == "") {
  //   key = settings_ds.get_D("key")
  // }

  // LexActivator.SetProductData("MkIyNEUwNDFGM0Q1RTZGNEI3Q0I5MjY5OTVDN0FBMUI=.xiRnFQQA/wIPfZUbQGs4OXu9cOiJFk+WHFW82g64PWn2jWX/2NNnVn982nZ+PaOYTmNZOWKXd0qt8+HY47sRiUs2jjW3FqIa8d51ibNmHXkIHT+4Lqrv9dZt+9g2sqiRFjO9foI0jlecKDFhrnYXGNrbsCZ6vGQK3gpKaaDe3zpf8cq44ZiUCUSEF4Zm30ljQb8qQ94Xxg35DZepzUk1lQAVw5+vmh0N5XIwcna9ApADxX34LiZS3qJyKByBvU3buQzYBR/Mvogqz2nJhuh5ywDyHAGkLAUP3oLWewZf0baNYAfFlhsfl/nGIpyLIBbQ1ZQTGhaT6MWICreBgvDTVQ/rvJbLxOSI3N+ls/oLOAefsHXSdbdclABap0OmWSkOrxsfFqzEasgMbgAbjApr4YSPbEKmolPmjlSVbobeqpzuSjO3asDnLWqVP4lp7Azj6kZE2+AYQPPLZs05q/7BCQh0QRgYAUYt96BwgAoB5VumWLRMbLcmk04A/o9O7MkgVNz7FxuHxzvLnHgyFTAmKiGfr3Y55zh3Lc5nhSeERQ4MYjiz6Dbu/HBxsEL+eo+QrM0WMXfUhvmOkIAQJnMRnl30rpHsWmx8amhsthg1fZQbr+3oh23+vC6YCe+9eiF5pdYxOLro2mck1tRY3qgLJpfm5NsUr42GSvp2yYxEMzBuA6qGf3zg8a8qPpRVhcMXxa7cfqR9apKKe3HXF2B6j5npIMdCIfZW7OVy3Fex54I=");
  // LexActivator.SetProductId("701bf685-7886-45e0-aa14-7dabe5ad1627", PermissionFlags.LA_USER);
  // try {
  //   LexActivator.SetLicenseKey(key);
  //   LexActivator.SetActivationMetadata('key1', 'value1');
  //   const status = LexActivator.ActivateLicense();
  //   if (LexStatusCodes.LA_OK == status) {
  //     settings_ds.add_D("key", key)
  //     return [1, 'License activated successfully!'];
  //   } else if (LexStatusCodes.LA_EXPIRED == status) {
  //     return [0, 'License activated successfully but has expired!'];
  //   } else if (LexStatusCodes.LA_SUSPENDED == status) {
  //     return [0, 'License activated successfully but has been suspended!'];
  //   } else if (LexStatusCodes.LA_FAIL == status) {
  //     return [-1, 'License failed to activate!'];
  //   }
  // } catch (error) {
  //   console.log(error);
  //   try {
  //     request.get("http://api.seigrobotics.com:5000/del_activation?key=" + key, (error, res, body) => {
  //       if (error) {
  //         console.error(error)
  //         return
  //       }
  //     })
  //   } catch (error) {
  //     console.log(error);
  //   }
  //   return [0, error.message, error.code];
  // }
}

module.exports.activation = activation;
module.exports.resetPwd = resetPwd;
