<?php

function load_images_from($dir)
{
    $tz = new DateTimeZone('America/New_York');
    $images = [];
    foreach (glob("{$dir}/*.jpg") as $name) {
        $base = basename($name);
        $time = DateTime::createFromFormat(
            'Y-m-d_H-i-s',
            substr($base, 3, 19)
        );

        if ($time === false) {
            continue;
        }

        $images[] = [
            'name' => $base,
            'time' => $time->getTimestamp(),
        ];
    }

    usort($images, function ($a, $b) {
        return $b['time'] - $a['time'];
    });

    return $images;
}

function get_param($name, $default = null)
{
    if (array_key_exists($name, $_GET)) {
        return $_GET[$name];
    }

    if (array_key_exists($name, $_POST)) {
        return $_POST[$name];
    }

    return $default;
}

$n = get_param('n', 5);
$images = array_slice(
    load_images_from(dirname(__FILE__) . '/..'),
    0,
    $n
);
header('Content-Type: application/json;charset=utf8');
printf("%s\n", json_encode($images));