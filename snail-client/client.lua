local handlers = {}
local RegistrationErrors = {
	[1] = 'Form failed validation.', -- Error: failed validation
	[2] = 'Email is already in use.', -- Error: Email in use
	[3] = 'Failed to save user.', -- Error: Failed to save user
	[4] = 'License is registered already.', -- Error: Already registered
}

local function CreatePeer ()
	Wait(0)

	print('CREATE NEW PEER')

	local peerId = exports['simple-peer']:NUIWrapper(function (id, dispatch, setHandler)
		local connected

		local replies = {
			data = function (action)
				connected = true
				-- print('simple-peer:data')
			end,
			close = function ()
				connected = false
				print('simple-peer:close')
			end,
			-- FIXME Doesn't trigger
			connect = function ()
				connected = true
				print('simple-peer:connect')
			end,
			error = function ()
				connected = false -- NOTE
				print('simple-peer:error')
			end,
			signal = function (action)
				print('simple-peer:signal', action.payload)
				if not connected then
					TriggerServerEvent('snaildash:Remote', action.payload)
				end
			end,
		}

		setHandler(function (action)
			local listener = replies[action and action.type]

			if listener then
				listener(action)
			end
		end)

		RegisterNetEvent('snaildash:Remote')
		AddEventHandler('snaildash:Remote', function (data)
			dispatch({ type = 'connect', payload = data })
		end)

		dispatch({ type = 'open' }, function (action)
			local payload = action.payload
		end)

		Citizen.CreateThread(function ()
			local prev
			local disposed

			while not disposed do
				if connected then
					if not prev then
						prev = true
						dispatch({
							type = 'send',
							payload = { type = 'connect', payload = 'Welcome' }
						})
					end

					dispatch({
						type = 'send',
						payload = {
							type = 'stats',
							payload = {
								health = GetEntityHealth(PlayerPedId())
							}
						}
					})

				else
					if prev then
						prev = false
						disposed = true
					end
				end

				Wait(100)
			end

			return Citizen.CreateThread(CreatePeer)
		end)
	end)
end

RegisterNetEvent('snaildash:Welcome')
RegisterNetEvent('snaildash:Register')
RegisterNetEvent('snaildash:Verify')

AddEventHandler('snaildash:Welcome', function (registered, verified)
	-- Client is registered already
	if registered then IsRegistered(verified)

	-- Client should register
	elseif not handlers.register then
		handlers.register = AddEventHandler('snaildash:Register', function (err, verified)
			if err and err ~= 4 then
				print(RegistrationErrors[err] or RegistrationErrors[1])

				return
			end

			IsRegistered()

			if verified then
				IsVerified()
			end
		end)
	end

	-- Client is verified already
	if verified then IsVerified()

	-- Client should verify
	elseif not handlers.verify then
		handlers.verify = AddEventHandler('snaildash:Verify', function (err, verified)
			if not err then
				IsVerified()
			end
		end)
	end

	-- Received welcome event
	onWelcome(registered, verified)
end)

--------------------------------------------------------------------------------

local isReady = false

function onWelcome (registered, verified)
	if not registered and not verified then
		-- TriggerServerEvent('snaildash:Register', 'bob@gmail.com', '123456')
	end
end

function IsRegistered (verified)
	if not verified then

	end
end

function IsVerified ()
	if not isReady then
		isReady = true

		-- Client is registered and verified, open the webrtc channel
		Citizen.CreateThread(CreatePeer)
	end
end
