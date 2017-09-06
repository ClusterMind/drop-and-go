
<?php

  $random = uniqid();

?>

<html>

<head>

  <script src = "lib/core/drop-and-go.js?id=<?=$random?>"></script>

</head>

<body>

  <script>

    var test = new DropAndGo({ localization : { lang : "en-US" } });

    test.test();

  </script>

</body>

</html>
