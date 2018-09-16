local NOOP = function () end
local ACTIONS = {}
local REPLY_ROUTE = 'onmessage'
local nextId = 0

function NUIWrapper (cb, actionCreators, replyRoute, whitelisted, id)
	local nuiReply = NOOP
	local dispatch = function (action, cb) -- SEND NUI ACTION
		if type(action) == 'string' then
			action = {
				type = action
			}
		end

		local listener = actionCreators[action and action.type]

		if whitelisted and not listener then
			return
		elseif not listener then
			listener = true
		end

		cb = cb and Citizen.GetFunctionReference(cb)

		action.meta = { id = id, callback = cb }

		if listener == true then
			SendNUIMessage(action)
		else
			listener(nuiReply, action, dispatch)
		end
	end

	actionCreators = actionCreators or ACTIONS

	if not id then
		nextId = nextId + 1
		id = nextId
	end

	local nui = RegisterNUICallback(replyRoute or REPLY_ROUTE, function (action)
		if action and action.meta and action.meta.id == id then
			if action.type == 'callback' then
				local status, payload = pcall(
					Citizen.InvokeFunctionReference(
						action.meta.callback, msgpack.pack({ action })
					)
				)
			end

			nuiReply(action)
		end
	end)

	-- RECEIVED NUI ACTION
	cb(id, dispatch,
		function (fn) nuiReply = fn end, --setHandler
		function (fn) dispatch = fn end --setDispatch
	)

	return id
end
