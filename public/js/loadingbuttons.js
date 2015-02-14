var previousButtonHTML = [];

function setButtonLoading(selector, customText)
{
	var html = '<i class="fa fa-circle-o-notch fa-spin"></i>';
	if(customText)
	{
		html += " " + customText;
	}
	var previd = hat();
	previousButtonHTML.push({ id: previd, html: $(selector).html() });
	$(selector).attr('disabled', 'true').attr('data-previous-text', previd);
	$(selector).html(html);
}

function setButtonLoadingText(selector, text)
{
	$(selector).html('<i class="fa fa-circle-o-notch fa-spin"></i> ' + text);
}

function unsetButtonLoading(selector)
{
	$(selector).removeAttr('disabled').html(findById(previousButtonHTML, $(selector).attr('data-previous-text')).html);
}