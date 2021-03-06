var socket = io();
var token = getCookie('token');

function getCookie(name)
{
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++)
	{
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function findById(source, id)
{
	for (var i = 0; i < source.length; i++)
	{
		if (source[i].id === id)
		{
			return source[i];
		}
	}
	return undefined;
}

function findIndexById(source, id)
{
	for (var i = 0; i < source.length; i++)
	{
		if (source[i].id === id)
		{
			return i;
		}
	}
	return -1;
}

function hat(bits, base) // Thanks to James Halliday for hat
{
	if (!base) base = 16;
	if (bits === undefined) bits = 128;
	if (bits <= 0) return '0';

	var digits = Math.log(Math.pow(2, bits)) / Math.log(base);
	for (var i = 2; digits === Infinity; i *= 2)
	{
		digits = Math.log(Math.pow(2, bits / i)) / Math.log(base) * i;
	}

	var rem = digits - Math.floor(digits);

	var res = '';

	for (var i = 0; i < Math.floor(digits); i++)
	{
		var x = Math.floor(Math.random() * base).toString(base);
		res = x + res;
	}

	if (rem)
	{
		var b = Math.pow(base, rem);
		var x = Math.floor(Math.random() * b).toString(base);
		res = x + res;
	}

	var parsed = parseInt(res, base);
	if (parsed !== Infinity && parsed >= Math.pow(2, bits))
	{
		return hat(bits, base)
	}
	else return res;
}